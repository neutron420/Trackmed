import prisma from "../config/database";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  connection,
  deriveBatchPDA,
  deriveManufacturerRegistryPDA,
  PROGRAM_ID,
} from "../config/solana";
import { IDL } from "../idl/solana_test_project";
import { createAuditTrail } from "./audit-trail.service";
import { sendNotification } from "./notification.service";

export interface BatchRegistrationData {
  // Proof fields (stored on both blockchain and database)
  batchHash: string;
  manufacturingDate: Date;
  expiryDate: Date;

  // Business details (database only)
  batchNumber: string;
  manufacturerId: string;
  medicineId: string;
  quantity: number;
  invoiceNumber?: string;
  invoiceDate?: Date;
  gstNumber?: string;
  warehouseLocation?: string;
  warehouseAddress?: string;
  imageUrl?: string; // Cloudflare R2 URL
}

/**
 * Register batch on blockchain using raw transactions
 * Returns transaction signature
 */
async function registerBatchOnBlockchain(
  manufacturerWallet: Keypair,
  batchHash: string,
  manufacturingDate: Date,
  expiryDate: Date,
  quantity: number,
  mrp: number,
  metadataHash?: string,
): Promise<{
  success: boolean;
  txHash?: string;
  pda?: string;
  error?: string;
}> {
  try {
    const manufacturingTimestamp = Math.floor(
      manufacturingDate.getTime() / 1000,
    );
    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

    const [batchPDA] = deriveBatchPDA(manufacturerWallet.publicKey, batchHash);
    const [registryPDA] = deriveManufacturerRegistryPDA(
      manufacturerWallet.publicKey,
    );

    // Build instruction data manually (Anchor IDL compatibility issue workaround)
    // Discriminator for register_batch: [255, 186, 59, 153, 95, 233, 143, 171]
    const discriminator = Buffer.from([255, 186, 59, 153, 95, 233, 143, 171]);

    // Encode batch_hash string (4 bytes length + string bytes)
    const batchHashBytes = Buffer.from(batchHash);
    const batchHashLen = Buffer.alloc(4);
    batchHashLen.writeUInt32LE(batchHashBytes.length, 0);

    // Encode i64 timestamps
    const mfgDateBuf = Buffer.alloc(8);
    mfgDateBuf.writeBigInt64LE(BigInt(manufacturingTimestamp), 0);

    const expDateBuf = Buffer.alloc(8);
    expDateBuf.writeBigInt64LE(BigInt(expiryTimestamp), 0);

    // Encode u64 quantity and mrp
    const qtyBuf = Buffer.alloc(8);
    qtyBuf.writeBigUInt64LE(BigInt(quantity), 0);

    const mrpBuf = Buffer.alloc(8);
    mrpBuf.writeBigUInt64LE(BigInt(mrp), 0);

    // Encode Option<String> for metadata_hash
    let metadataOptionBuf: Buffer;
    if (metadataHash) {
      const metadataBytes = Buffer.from(metadataHash);
      const metadataLen = Buffer.alloc(4);
      metadataLen.writeUInt32LE(metadataBytes.length, 0);
      metadataOptionBuf = Buffer.concat([
        Buffer.from([1]),
        metadataLen,
        metadataBytes,
      ]);
    } else {
      metadataOptionBuf = Buffer.from([0]); // None
    }

    const data = Buffer.concat([
      discriminator,
      batchHashLen,
      batchHashBytes,
      mfgDateBuf,
      expDateBuf,
      qtyBuf,
      mrpBuf,
      metadataOptionBuf,
    ]);

    const instruction = new Transaction().add({
      keys: [
        { pubkey: batchPDA, isSigner: false, isWritable: true },
        { pubkey: registryPDA, isSigner: false, isWritable: false },
        {
          pubkey: manufacturerWallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: anchor.web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data,
    });

    instruction.feePayer = manufacturerWallet.publicKey;
    instruction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    instruction.sign(manufacturerWallet);

    const signature = await connection.sendRawTransaction(
      instruction.serialize(),
    );
    await connection.confirmTransaction(signature, "confirmed");

    return {
      success: true,
      txHash: signature,
      pda: batchPDA.toBase58(),
    };
  } catch (error: any) {
    // Log full error to help debug RPC / Anchor issues
    console.error("[Blockchain] registerBatchOnBlockchain failed:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return {
      success: false,
      error: error.message || "Failed to register batch on blockchain",
    };
  }
}

/**
 * Register batch on both blockchain and database
 * This is the main registration function
 */
export async function registerBatch(
  manufacturerWallet: Keypair,
  data: BatchRegistrationData,
): Promise<{
  success: boolean;
  batchId?: string;
  blockchainTxHash?: string;
  blockchainPda?: string;
  error?: string;
}> {
  try {
    // Step 1: Get manufacturer from database by wallet address (derived from private key)
    const walletAddress = manufacturerWallet.publicKey.toBase58();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { walletAddress },
    });

    if (!manufacturer) {
      return {
        success: false,
        error: `Manufacturer not found for wallet address ${walletAddress}. Please register your manufacturer account first with this wallet address.`,
      };
    }

    // Use the manufacturer ID from the database (ignore the one passed in data)
    const actualManufacturerId = manufacturer.id;

    // Fetch medicine to get MRP for blockchain registration
    const medicine = await prisma.medicine.findUnique({
      where: { id: data.medicineId },
      select: { mrp: true },
    });

    // Get MRP from medicine (convert to smallest unit - paise for blockchain)
    // Medicine stores MRP in rupees with decimals, blockchain wants paise (integer)
    // Prisma Decimal needs to be converted to number first
    const mrpInPaise = medicine?.mrp
      ? Math.round(Number(medicine.mrp) * 100)
      : 100;

    // Step 2: Register on blockchain first (best-effort)
    const blockchainResult = await registerBatchOnBlockchain(
      manufacturerWallet,
      data.batchHash,
      data.manufacturingDate,
      data.expiryDate,
      data.quantity,
      mrpInPaise,
      undefined, // metadata_hash - can be IPFS hash if storing detailed metadata off-chain
    );

    if (!blockchainResult.success) {
      // Log the blockchain failure but continue with database registration
      console.error(
        "[BatchRegistration] Blockchain registration failed, continuing with DB only:",
        {
          batchHash: data.batchHash,
          error: blockchainResult.error,
        },
      );
    }

    // Step 3: Store in database with proof fields + business details
    const batch = await prisma.batch.create({
      data: {
        // Proof fields (same as blockchain)
        batchHash: data.batchHash,
        manufacturingDate: data.manufacturingDate,
        expiryDate: data.expiryDate,
        status: "VALID", // Default status
        createdAt: new Date(),

        // Blockchain transaction reference (may be undefined if blockchain failed)
        blockchainTxHash: blockchainResult.txHash,
        blockchainPda: blockchainResult.pda,

        // Business details (database only)
        batchNumber: data.batchNumber,
        manufacturerId: actualManufacturerId,
        medicineId: data.medicineId,
        quantity: data.quantity,
        remainingQuantity: data.quantity, // Initialize remaining quantity
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        gstNumber: data.gstNumber,
        warehouseLocation: data.warehouseLocation,
        warehouseAddress: data.warehouseAddress,
        imageUrl: data.imageUrl,
        lifecycleStatus: "IN_PRODUCTION",
      },
      include: {
        manufacturer: {
          select: {
            name: true,
          },
        },
        medicine: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send notification to admin(s) about new batch registration
    try {
      await sendNotification({
        type: "BATCH_CREATED",
        batchId: batch.id,
        message: `Manufacturer ${batch.manufacturer.name} uploaded new batch: ${batch.batchNumber} (${batch.medicine.name}, Qty: ${batch.quantity})`,
        severity: "INFO",
        targetRoles: ["ADMIN", "SUPERADMIN"],
        metadata: {
          manufacturerId: batch.manufacturerId,
          manufacturerName: batch.manufacturer.name,
          medicineId: batch.medicineId,
          medicineName: batch.medicine.name,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
        },
      });
    } catch (notifyErr) {
      console.error(
        "Failed to send admin notification for new batch:",
        notifyErr,
      );
    }

    // Create audit trail (will be called from route with user context)

    const result: {
      success: boolean;
      batchId?: string;
      blockchainTxHash?: string;
      blockchainPda?: string;
      error?: string;
    } = {
      success: true,
      batchId: batch.id,
    };

    if (blockchainResult.success && blockchainResult.txHash) {
      result.blockchainTxHash = blockchainResult.txHash;
    }
    if (blockchainResult.success && blockchainResult.pda) {
      result.blockchainPda = blockchainResult.pda;
    }

    return result;
  } catch (error: any) {
    console.error("[BatchRegistration] registerBatch failed:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      manufacturerId: data?.manufacturerId,
      medicineId: data?.medicineId,
      batchHash: data?.batchHash,
    });
    return {
      success: false,
      error: error.message || "Failed to register batch",
    };
  }
}

/**
 * Update batch status on both blockchain and database
 */
export async function updateBatchStatus(
  manufacturerWallet: Keypair,
  batchHash: string,
  newStatus: "VALID" | "RECALLED",
): Promise<{
  success: boolean;
  blockchainTxHash?: string;
  error?: string;
}> {
  try {
    // Step 1: Get batch from database
    const batch = await prisma.batch.findUnique({
      where: { batchHash },
      include: { manufacturer: true },
    });

    if (!batch) {
      return {
        success: false,
        error: "Batch not found",
      };
    }

    // Verify wallet address matches
    if (
      batch.manufacturer.walletAddress !==
      manufacturerWallet.publicKey.toBase58()
    ) {
      return {
        success: false,
        error: "Unauthorized: Wallet address mismatch",
      };
    }

    // Step 2: Update on blockchain
    const wallet = new anchor.Wallet(manufacturerWallet);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new (Program as any)(IDL as any, PROGRAM_ID, provider);

    const [batchPDA] = deriveBatchPDA(manufacturerWallet.publicKey, batchHash);

    const statusEnum = newStatus === "VALID" ? { valid: {} } : { recalled: {} };

    const methods = program.methods as any;
    const tx = await methods
      .updateBatchStatus(batchHash, statusEnum)
      .accounts({
        batch: batchPDA,
        manufacturer: manufacturerWallet.publicKey,
      })
      .rpc();

    // Step 3: Update in database
    const updatedBatch = await prisma.batch.update({
      where: { batchHash },
      data: {
        status: newStatus,
      },
    });

    // Create audit trail (will be called from route with user context)

    return {
      success: true,
      blockchainTxHash: tx,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update batch status",
    };
  }
}
