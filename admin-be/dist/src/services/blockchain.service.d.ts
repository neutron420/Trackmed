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
export declare function verifyBatchOnBlockchain(batchHash: string, manufacturerWallet: string): Promise<{
    exists: boolean;
    data?: BlockchainBatch;
    pda?: string;
    error?: string;
}>;
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