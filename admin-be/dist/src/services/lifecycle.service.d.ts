import { LifecycleStatus } from '@prisma/client';
/**
 * Update batch lifecycle status
 */
export declare function updateLifecycleStatus(batchId: string, newStatus: LifecycleStatus, distributorId?: string, pharmacyId?: string, performedBy?: string, performedByRole?: string): Promise<{
    success: boolean;
    batch?: any;
    error?: string;
}>;
/**
 * Mark batch as sold (decrease remaining quantity)
 */
export declare function markBatchAsSold(batchId: string, quantity: number, performedBy?: string, performedByRole?: string): Promise<{
    success: boolean;
    batch?: any;
    error?: string;
}>;
//# sourceMappingURL=lifecycle.service.d.ts.map