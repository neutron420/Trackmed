import prisma from '../config/database';
import { sendLowStockNotification, sendExpiryWarning } from './notification.service';
import { createAuditTrail } from './audit-trail.service';

/**
 * Check for low stock batches
 */
export async function checkLowStock(threshold: number = 10) {
  const lowStockBatches = await prisma.batch.findMany({
    where: {
      remainingQuantity: {
        lte: threshold,
      },
      lifecycleStatus: {
        notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
      },
    },
    include: {
      manufacturer: true,
      medicine: true,
    },
  });

  // Send notifications for low stock
  for (const batch of lowStockBatches) {
    await sendLowStockNotification(
      batch.id,
      batch.batchNumber,
      batch.remainingQuantity
    );
  }

  return lowStockBatches;
}

/**
 * Check for expiring batches
 */
export async function checkExpiringBatches(daysAhead: number = 30) {
  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + daysAhead);

  const expiringBatches = await prisma.batch.findMany({
    where: {
      expiryDate: {
        gte: today,
        lte: expiryDate,
      },
      lifecycleStatus: {
        notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
      },
    },
    include: {
      manufacturer: true,
      medicine: true,
    },
  });

  // Send notifications for expiring batches
  for (const batch of expiringBatches) {
    const daysUntilExpiry = Math.ceil(
      (batch.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    await sendExpiryWarning(batch.id, batch.batchNumber, daysUntilExpiry);
  }

  return expiringBatches;
}

/**
 * Get inventory summary
 */
export async function getInventorySummary() {
  const [
    totalBatches,
    totalQuantity,
    totalRemaining,
    lowStockCount,
    expiringCount,
    expiredCount,
  ] = await Promise.all([
    prisma.batch.count({
      where: {
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
    }),
    prisma.batch.aggregate({
      where: {
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.batch.aggregate({
      where: {
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
      _sum: {
        remainingQuantity: true,
      },
    }),
    prisma.batch.count({
      where: {
        remainingQuantity: {
          lte: 10,
        },
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
    }),
    prisma.batch.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
    }),
    prisma.batch.count({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        lifecycleStatus: {
          notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
        },
      },
    }),
  ]);

  return {
    totalBatches,
    totalQuantity: totalQuantity._sum.quantity || 0,
    totalRemaining: totalRemaining._sum.remainingQuantity || 0,
    lowStockCount,
    expiringCount,
    expiredCount,
    soldQuantity:
      (totalQuantity._sum.quantity || 0) - (totalRemaining._sum.remainingQuantity || 0),
  };
}

/**
 * Get inventory by manufacturer
 */
export async function getInventoryByManufacturer() {
  return prisma.batch.groupBy({
    by: ['manufacturerId'],
    where: {
      lifecycleStatus: {
        notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
      },
    },
    _sum: {
      quantity: true,
      remainingQuantity: true,
    },
    _count: {
      id: true,
    },
  });
}

/**
 * Get inventory by medicine
 */
export async function getInventoryByMedicine() {
  return prisma.batch.groupBy({
    by: ['medicineId'],
    where: {
      lifecycleStatus: {
        notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
      },
    },
    _sum: {
      quantity: true,
      remainingQuantity: true,
    },
    _count: {
      id: true,
    },
  });
}

/**
 * Mark expired batches
 */
export async function markExpiredBatches() {
  const expiredBatches = await prisma.batch.findMany({
    where: {
      expiryDate: {
        lt: new Date(),
      },
      lifecycleStatus: {
        notIn: ['EXPIRED', 'SOLD', 'RECALLED'],
      },
    },
  });

  for (const batch of expiredBatches) {
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        lifecycleStatus: 'EXPIRED',
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'BATCH',
      entityId: batch.id,
      action: 'LIFECYCLE_CHANGE',
      fieldName: 'lifecycleStatus',
      oldValue: batch.lifecycleStatus,
      newValue: 'EXPIRED',
      performedBy: 'system',
      performedByRole: undefined, // System action, no user role
      metadata: { reason: 'Automatic expiry' },
    });
  }

  return expiredBatches;
}
