import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
export interface BlockchainBatch {
    batchHash: string;
    manufacturerWallet: PublicKey;
    manufacturingDate: anchor.BN;
    expiryDate: anchor.BN;
    status: {
        valid?: {};
        recalled?: {};
    };
    createdAt: anchor.BN;
}
/**
 * Verify batch exists on blockchain and fetch its data
 * This is the ONLY source of truth for batch authenticity
 */
export declare function verifyBatchOnBlockchain(batchHash: string, manufacturerWallet: string): Promise<{
    exists: boolean;
    data?: BlockchainBatch;
    pda?: string;
    error?: string;
}>;
/**
 * Check if batch status is valid (not recalled)
 */
export declare function isBatchValid(status: {
    valid?: {};
    recalled?: {};
}): boolean;
/**
 * Check if batch is expired based on blockchain expiry date
 */
export declare function isBatchExpired(expiryDate: anchor.BN): boolean;
/**
 * Get batch status string from blockchain status enum
 */
export declare function getBatchStatusString(status: {
    valid?: {};
    recalled?: {};
}): 'Valid' | 'Recalled';
//# sourceMappingURL=blockchain.service.d.ts.map