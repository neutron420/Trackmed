import prisma from '../config/database';
import { createAuditTrail } from './audit-trail.service';
import { LifecycleStatus } from '@prisma/client';
import { sendNotification } from './notification.service';

/**
 * Update batch lifecycle status
 */
export async function updateLifecycleStatus(
  batchId: string,
  newStatus: LifecycleStatus,
  distributorId?: string,
  pharmacyId?: string,
  performedBy: string = 'system',
  performedByRole?: string
): Promise<{
  success: boolean;
  batch?: any;
  error?: string;
}> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        manufacturer: true,
        medicine: true,
      },
    });

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    const oldStatus = batch.lifecycleStatus;

    // Validate status transition
    const validTransitions: Record<LifecycleStatus, LifecycleStatus[]> = {
      IN_PRODUCTION: ['IN_TRANSIT'],
      IN_TRANSIT: ['AT_DISTRIBUTOR', 'AT_PHARMACY'],
      AT_DISTRIBUTOR: ['IN_TRANSIT', 'AT_PHARMACY'],
      AT_PHARMACY: ['SOLD'],
      SOLD: [],
      EXPIRED: [],
      RECALLED: [],
    };

    if (oldStatus !== newStatus && !validTransitions[oldStatus]?.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${oldStatus} to ${newStatus}`,
      };
    }

    // Update batch
    const updateData: any = {
      lifecycleStatus: newStatus,
    };

    if (distributorId && (newStatus === 'AT_DISTRIBUTOR' || newStatus === 'IN_TRANSIT')) {
      updateData.distributorId = distributorId;
    }

    if (pharmacyId && (newStatus === 'AT_PHARMACY' || newStatus === 'SOLD')) {
      updateData.pharmacyId = pharmacyId;
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: updateData,
      include: {
        manufacturer: true,
        medicine: true,
        distributor: true,
        pharmacy: true,
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'BATCH',
      entityId: batchId,
      action: 'LIFECYCLE_CHANGE',
      fieldName: 'lifecycleStatus',
      oldValue: oldStatus,
      newValue: newStatus,
      performedBy,
      performedByRole,
      metadata: { distributorId, pharmacyId },
    });

    // Send notification
    await sendNotification({
      type: 'LIFECYCLE_CHANGE',
      batchId,
      message: `Batch ${batch.batchNumber} status changed from ${oldStatus} to ${newStatus}`,
      severity: 'INFO',
      metadata: {
        batchNumber: batch.batchNumber,
        oldStatus,
        newStatus,
      },
    });

    return {
      success: true,
      batch: updatedBatch,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update lifecycle status',
    };
  }
}

/**
 * Mark batch as sold (decrease remaining quantity)
 */
export async function markBatchAsSold(
  batchId: string,
  quantity: number,
  performedBy: string = 'system',
  performedByRole?: string
): Promise<{
  success: boolean;
  batch?: any;
  error?: string;
}> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    if (batch.remainingQuantity < quantity) {
      return {
        success: false,
        error: 'Insufficient quantity available',
      };
    }

    const newRemainingQuantity = batch.remainingQuantity - quantity;
    const newLifecycleStatus = newRemainingQuantity === 0 ? 'SOLD' : batch.lifecycleStatus;

    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        remainingQuantity: newRemainingQuantity,
        lifecycleStatus: newLifecycleStatus,
      },
      include: {
        manufacturer: true,
        medicine: true,
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'BATCH',
      entityId: batchId,
      action: 'QUANTITY_CHANGE',
      fieldName: 'remainingQuantity',
      oldValue: String(batch.remainingQuantity),
      newValue: String(newRemainingQuantity),
      performedBy,
      performedByRole,
      metadata: { soldQuantity: quantity },
    });

    return {
      success: true,
      batch: updatedBatch,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark batch as sold',
    };
  }
}
