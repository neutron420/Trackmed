/**
 * Check for low stock batches
 */
export declare function checkLowStock(threshold?: number): Promise<({
    manufacturer: {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gstNumber: string | null;
        address: string;
        licenseNumber: string;
        city: string | null;
        state: string | null;
        country: string;
        phone: string | null;
        walletAddress: string;
        isVerified: boolean;
    };
    medicine: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        genericName: string | null;
        strength: string;
        composition: string;
        dosageForm: string;
        mrp: import("@prisma/client/runtime/library").Decimal;
        storageCondition: string | null;
        imageUrl: string | null;
        description: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    batchHash: string;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: import(".prisma/client").$Enums.BatchStatus;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    remainingQuantity: number;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: import(".prisma/client").$Enums.LifecycleStatus;
    distributorId: string | null;
    pharmacyId: string | null;
})[]>;
/**
 * Check for expiring batches
 */
export declare function checkExpiringBatches(daysAhead?: number): Promise<({
    manufacturer: {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gstNumber: string | null;
        address: string;
        licenseNumber: string;
        city: string | null;
        state: string | null;
        country: string;
        phone: string | null;
        walletAddress: string;
        isVerified: boolean;
    };
    medicine: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        genericName: string | null;
        strength: string;
        composition: string;
        dosageForm: string;
        mrp: import("@prisma/client/runtime/library").Decimal;
        storageCondition: string | null;
        imageUrl: string | null;
        description: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    batchHash: string;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: import(".prisma/client").$Enums.BatchStatus;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    remainingQuantity: number;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: import(".prisma/client").$Enums.LifecycleStatus;
    distributorId: string | null;
    pharmacyId: string | null;
})[]>;
/**
 * Get inventory summary
 */
export declare function getInventorySummary(): Promise<{
    totalBatches: number;
    totalQuantity: number;
    totalRemaining: number;
    lowStockCount: number;
    expiringCount: number;
    expiredCount: number;
    soldQuantity: number;
}>;
/**
 * Get inventory by manufacturer
 */
export declare function getInventoryByManufacturer(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.BatchGroupByOutputType, "manufacturerId"[]> & {
    _count: {
        id: number;
    };
    _sum: {
        quantity: number | null;
        remainingQuantity: number | null;
    };
})[]>;
/**
 * Get inventory by medicine
 */
export declare function getInventoryByMedicine(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.BatchGroupByOutputType, "medicineId"[]> & {
    _count: {
        id: number;
    };
    _sum: {
        quantity: number | null;
        remainingQuantity: number | null;
    };
})[]>;
/**
 * Mark expired batches
 */
export declare function markExpiredBatches(): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    batchHash: string;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: import(".prisma/client").$Enums.BatchStatus;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    remainingQuantity: number;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: import(".prisma/client").$Enums.LifecycleStatus;
    distributorId: string | null;
    pharmacyId: string | null;
}[]>;
//# sourceMappingURL=inventory.service.d.ts.map