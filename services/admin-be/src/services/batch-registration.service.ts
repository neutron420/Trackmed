import prisma from '../config/database';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { connection, deriveBatchPDA, deriveManufacturerRegistryPDA, PROGRAM_ID } from '../config/solana';
import { IDL } from '../idl/solana_test_project';
import { createAuditTrail } from './audit-trail.service';
import { sendNotification } from './notification.service';


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
 * Register batch on blockchain
 * Returns transaction signature
 */
async function registerBatchOnBlockchain(
  manufacturerWallet: Keypair,
  batchHash: string,
  manufacturingDate: Date,
  expiryDate: Date
): Promise<{ success: boolean; txHash?: string; pda?: string; error?: string }> {
  try {
    // Use a provider with a dummy wallet and pass the actual signer explicitly.
    // This avoids Anchor trying to read wallet metadata (like `address`) from the provider.
    const provider = new anchor.AnchorProvider(connection, {} as anchor.Wallet, {
      commitment: 'confirmed',
    });
    const program = new (Program as any)(IDL as any, PROGRAM_ID, provider);

    const manufacturingTimestamp = Math.floor(manufacturingDate.getTime() / 1000);
    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

    const [batchPDA] = deriveBatchPDA(manufacturerWallet.publicKey, batchHash);
    const [registryPDA] = deriveManufacturerRegistryPDA(manufacturerWallet.publicKey);

    // Call register_batch instruction
    const methods = program.methods as any;
    const tx = await methods
      .registerBatch(
        batchHash,
        new anchor.BN(manufacturingTimestamp),
        new anchor.BN(expiryTimestamp)
      )
      .accounts({
        batch: batchPDA,
        registry: registryPDA,
        manufacturer: manufacturerWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      // Explicitly sign with the manufacturer wallet keypair
      .signers([manufacturerWallet])
      .rpc();

    return {
      success: true,
      txHash: tx,
      pda: batchPDA.toBase58(),
    };
  } catch (error: any) {
    // Log full error to help debug RPC / Anchor issues
    console.error('[Blockchain] registerBatchOnBlockchain failed:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return {
      success: false,
      error: error.message || 'Failed to register batch on blockchain',
    };
  }
}

/**
 * Register batch on both blockchain and database
 * This is the main registration function
 */
export async function registerBatch(
  manufacturerWallet: Keypair,
  data: BatchRegistrationData
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

    // Step 2: Register on blockchain first (best-effort)
    const blockchainResult = await registerBatchOnBlockchain(
      manufacturerWallet,
      data.batchHash,
      data.manufacturingDate,
      data.expiryDate
    );

    if (!blockchainResult.success) {
      // Log the blockchain failure but continue with database registration
      console.error('[BatchRegistration] Blockchain registration failed, continuing with DB only:', {
        batchHash: data.batchHash,
        error: blockchainResult.error,
      });
    }

    // Step 3: Store in database with proof fields + business details
    const batch = await prisma.batch.create({
      data: {
        // Proof fields (same as blockchain)
        batchHash: data.batchHash,
        manufacturingDate: data.manufacturingDate,
        expiryDate: data.expiryDate,
        status: 'VALID', // Default status
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
        lifecycleStatus: 'IN_PRODUCTION',
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
        type: 'BATCH_CREATED',
        batchId: batch.id,
        message: `Manufacturer ${batch.manufacturer.name} uploaded new batch: ${batch.batchNumber} (${batch.medicine.name}, Qty: ${batch.quantity})`,
        severity: 'INFO',
        targetRoles: ['ADMIN', 'SUPERADMIN'],
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
      console.error('Failed to send admin notification for new batch:', notifyErr);
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
    console.error('[BatchRegistration] registerBatch failed:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      manufacturerId: data?.manufacturerId,
      medicineId: data?.medicineId,
      batchHash: data?.batchHash,
    });
    return {
      success: false,
      error: error.message || 'Failed to register batch',
    };
  }
}

/**
 * Update batch status on both blockchain and database
 */
export async function updateBatchStatus(
  manufacturerWallet: Keypair,
  batchHash: string,
  newStatus: 'VALID' | 'RECALLED'
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
        error: 'Batch not found',
      };
    }

    // Verify wallet address matches
    if (batch.manufacturer.walletAddress !== manufacturerWallet.publicKey.toBase58()) {
      return {
        success: false,
        error: 'Unauthorized: Wallet address mismatch',
      };
    }

    // Step 2: Update on blockchain
    const wallet = new anchor.Wallet(manufacturerWallet);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const program = new (Program as any)(IDL as any, PROGRAM_ID, provider);

    const [batchPDA] = deriveBatchPDA(manufacturerWallet.publicKey, batchHash);

    const statusEnum = newStatus === 'VALID' 
      ? { valid: {} } 
      : { recalled: {} };

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
      error: error.message || 'Failed to update batch status',
    };
  }
}
