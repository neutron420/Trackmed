/**
 * Generate QR codes for a batch
 */
export declare function generateQRCodes(batchId: string, quantity: number, performedBy: string, performedByRole?: string): Promise<{
    success: boolean;
    qrCodes?: Array<{
        id: string;
        code: string;
        unitNumber: number | null;
    }>;
    error?: string;
}>;
/**
 * Get QR codes for a batch
 */
export declare function getQRCodesForBatch(batchId: string, page?: number, limit?: number): Promise<{
    qrCodes: ({
        _count: {
            scanLogs: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        batchId: string;
        unitNumber: number | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Deactivate a QR code
 */
export declare function deactivateQRCode(qrCodeId: string, performedBy: string, performedByRole?: string): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    code: string;
    batchId: string;
    unitNumber: number | null;
}>;
//# sourceMappingURL=qr-code.service.d.ts.map