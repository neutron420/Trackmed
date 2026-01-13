import { Prisma } from '@prisma/client';
/**
 * Record analytics metric
 */
export declare function recordAnalytics(date: Date, metricType: string, metricValue: number, metadata?: any): Promise<{
    id: string;
    createdAt: Date;
    metadata: Prisma.JsonValue | null;
    date: Date;
    metricType: string;
    metricValue: Prisma.Decimal;
}>;
/**
 * Get analytics for a date range
 */
export declare function getAnalytics(startDate: Date, endDate: Date, metricType?: string): Promise<{
    id: string;
    createdAt: Date;
    metadata: Prisma.JsonValue | null;
    date: Date;
    metricType: string;
    metricValue: Prisma.Decimal;
}[]>;
/**
 * Generate daily scan statistics
 */
export declare function generateScanStatistics(date: Date): Promise<{
    totalScans: number;
    verifiedScans: number;
    fraudAlerts: number;
    uniqueBatches: number;
    uniqueUsers: number;
    verificationRate: number;
}>;
/**
 * Generate batch statistics
 */
export declare function generateBatchStatistics(): Promise<{
    totalBatches: number;
    validBatches: number;
    recalledBatches: number;
    expiredBatches: number;
    lifecycle: {
        inProduction: number;
        inTransit: number;
        atDistributor: number;
        atPharmacy: number;
        sold: number;
    };
}>;
/**
 * Get fraud statistics
 */
export declare function getFraudStatistics(startDate: Date, endDate: Date): Promise<{
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
    total: number;
}>;
//# sourceMappingURL=analytics.service.d.ts.map