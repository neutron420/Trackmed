import prisma from '../config/database';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { connection, deriveBatchPDA, deriveManufacturerRegistryPDA, PROGRAM_ID } from '../config/solana';
import { IDL } from '../idl/solana_test_project';

/**
 * Register batch on both blockchain and database
 * This is called at batch registration time
 */
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
    const wallet = new anchor.Wallet(manufacturerWallet);
    const provider = new anchor.AnchorProvider(connection, wallet, {
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
      .rpc();

    return {
      success: true,
      txHash: tx,
      pda: batchPDA.toBase58(),
    };
  } catch (error: any) {
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
    // Step 1: Get manufacturer from database
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: data.manufacturerId },
    });

    if (!manufacturer) {
      return {
        success: false,
        error: 'Manufacturer not found',
      };
    }

    // Verify wallet address matches
    if (manufacturer.walletAddress !== manufacturerWallet.publicKey.toBase58()) {
      return {
        success: false,
        error: 'Manufacturer wallet address mismatch',
      };
    }

    // Step 2: Register on blockchain first
    const blockchainResult = await registerBatchOnBlockchain(
      manufacturerWallet,
      data.batchHash,
      data.manufacturingDate,
      data.expiryDate
    );

    if (!blockchainResult.success) {
      return {
        success: false,
        error: blockchainResult.error || 'Failed to register on blockchain',
      };
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
        
        // Blockchain transaction reference
        blockchainTxHash: blockchainResult.txHash,
        blockchainPda: blockchainResult.pda,
        
        // Business details (database only)
        batchNumber: data.batchNumber,
        manufacturerId: data.manufacturerId,
        medicineId: data.medicineId,
        quantity: data.quantity,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        gstNumber: data.gstNumber,
        warehouseLocation: data.warehouseLocation,
        warehouseAddress: data.warehouseAddress,
        lifecycleStatus: 'IN_PRODUCTION',
      },
    });

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
    
    if (blockchainResult.txHash) {
      result.blockchainTxHash = blockchainResult.txHash;
    }
    if (blockchainResult.pda) {
      result.blockchainPda = blockchainResult.pda;
    }
    
    return result;
  } catch (error: any) {
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
    await prisma.batch.update({
      where: { batchHash },
      data: {
        status: newStatus,
      },
    });

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
