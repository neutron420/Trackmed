import { PublicKey } from '@solana/web3.js';
import { connection, deriveBatchPDA, PROGRAM_ID } from '../config/solana';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { IDL } from '../idl/solana_test_project';

// Blockchain Batch data structure (matches on-chain struct)
export interface BlockchainBatch {
  batchHash: string;
  manufacturerWallet: PublicKey;
  manufacturingDate: anchor.BN;
  expiryDate: anchor.BN;
  status: { valid?: {}; recalled?: {} };
  createdAt: anchor.BN;
}


export async function verifyBatchOnBlockchain(
  batchHash: string,
  manufacturerWallet: string
): Promise<{
  exists: boolean;
  data?: BlockchainBatch;
  pda?: string;
  error?: string;
}> {
  try {
    const manufacturerPubkey = new PublicKey(manufacturerWallet);
    const [batchPDA] = deriveBatchPDA(manufacturerPubkey, batchHash);

    // Fetch account data
    const accountInfo = await connection.getAccountInfo(batchPDA);
    
    if (!accountInfo) {
      return { exists: false, error: 'Batch not found on blockchain' };
    }

    // Decode account data using Anchor
    const provider = new anchor.AnchorProvider(connection, {} as anchor.Wallet, {
      commitment: 'confirmed',
    });
    const program = new (Program as any)(IDL as any, PROGRAM_ID, provider);

    const accounts = program.account as any;
    const batchAccount = await accounts.batch.fetch(batchPDA);
    
    // Convert to our interface format
    const batchData: BlockchainBatch = {
      batchHash: batchAccount.batchHash,
      manufacturerWallet: batchAccount.manufacturerWallet,
      manufacturingDate: batchAccount.manufacturingDate,
      expiryDate: batchAccount.expiryDate,
      status: batchAccount.status,
      createdAt: batchAccount.createdAt,
    };

    return {
      exists: true,
      data: batchData,
      pda: batchPDA.toBase58(),
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Failed to verify batch on blockchain',
    };
  }
}

/**
 * Check if batch status is valid (not recalled)
 */
export function isBatchValid(status: { valid?: {}; recalled?: {} }): boolean {
  return 'valid' in status;
}

/**
 * Check if batch is expired based on blockchain expiry date
 */
export function isBatchExpired(expiryDate: anchor.BN): boolean {
  const currentTimestamp = new anchor.BN(Math.floor(Date.now() / 1000));
  return expiryDate.lt(currentTimestamp);
}

/**
 * Get batch status string from blockchain status enum
 */
export function getBatchStatusString(status: { valid?: {}; recalled?: {} }): 'Valid' | 'Recalled' {
  return 'valid' in status ? 'Valid' : 'Recalled';
}
