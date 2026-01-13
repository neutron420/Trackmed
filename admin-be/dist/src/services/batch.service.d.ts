/**
 * Batch data returned to frontend - ONLY from database
 * Blockchain verification happens internally and is not exposed
 */
export interface BatchData {
    id: string;
    batchHash: string;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: 'VALID' | 'RECALLED';
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    manufacturer: {
        id: string;
        name: string;
        licenseNumber: string;
        address: string;
        walletAddress: string;
    };
    medicine: {
        id: string;
        name: string;
        genericName: string | null;
        strength: string;
        composition: string;
        dosageForm: string;
        mrp: number;
        imageUrl: string | null;
    };
    quantity: number;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    verificationError?: string;
}
/**
 * Verify batch originality using blockchain (internal) and return database data
 * Frontend receives ONLY database data, blockchain verification is internal
 */
export declare function verifyAndGetBatch(batchHash: string): Promise<{
    success: boolean;
    data?: BatchData;
    error?: string;
}>;
/**
 * Verify QR code and return database data only
 */
export declare function verifyQRCode(qrCode: string): Promise<{
    success: boolean;
    data?: BatchData & {
        qrCode: {
            id: string;
            unitNumber: number | null;
        };
    };
    error?: string;
}>;
/**
 * Log a scan event
 */
export declare function logScan(data: {
    qrCodeId: string;
    batchId: string;
    userId?: string;
    deviceId?: string;
    deviceModel?: string;
    deviceOS?: string;
    appVersion?: string;
    locationLat?: number;
    locationLng?: number;
    locationAddress?: string;
    scanType?: 'VERIFICATION' | 'PURCHASE' | 'DISTRIBUTION' | 'RECALL_CHECK';
    blockchainVerified: boolean;
    blockchainStatus?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: string | null;
    batchId: string;
    deviceId: string | null;
    deviceModel: string | null;
    deviceOS: string | null;
    appVersion: string | null;
    locationLat: import("@prisma/client/runtime/library").Decimal | null;
    locationLng: import("@prisma/client/runtime/library").Decimal | null;
    locationAddress: string | null;
    scanType: import(".prisma/client").$Enums.ScanType;
    blockchainVerified: boolean;
    blockchainStatus: string | null;
    qrCodeId: string;
}>;
//# sourceMappingURL=batch.service.d.ts.map