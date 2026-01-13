import { Keypair } from '@solana/web3.js';
/**
 * Register batch on both blockchain and database
 * This is called at batch registration time
 */
export interface BatchRegistrationData {
    batchHash: string;
    manufacturingDate: Date;
    expiryDate: Date;
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
 * Register batch on both blockchain and database
 * This is the main registration function
 */
export declare function registerBatch(manufacturerWallet: Keypair, data: BatchRegistrationData): Promise<{
    success: boolean;
    batchId?: string;
    blockchainTxHash?: string;
    blockchainPda?: string;
    error?: string;
}>;
/**
 * Update batch status on both blockchain and database
 */
export declare function updateBatchStatus(manufacturerWallet: Keypair, batchHash: string, newStatus: 'VALID' | 'RECALLED'): Promise<{
    success: boolean;
    blockchainTxHash?: string;
    error?: string;
}>;
//# sourceMappingURL=batch-registration.service.d.ts.map