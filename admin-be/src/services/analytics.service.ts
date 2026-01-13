import prisma from '../config/database';
import { Prisma } from '@prisma/client';

/**
 * Record analytics metric
 */
export async function recordAnalytics(
  date: Date,
  metricType: string,
  metricValue: number,
  metadata?: any
) {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return prisma.analytics.upsert({
    where: {
      date_metricType: {
        date: dateOnly,
        metricType,
      },
    },
    update: {
      metricValue: new Prisma.Decimal(metricValue),
      metadata: metadata || {},
    },
    create: {
      date: dateOnly,
      metricType,
      metricValue: new Prisma.Decimal(metricValue),
      metadata: metadata || {},
    },
  });
}

/**
 * Get analytics for a date range
 */
export async function getAnalytics(
  startDate: Date,
  endDate: Date,
  metricType?: string
) {
  const where: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (metricType) {
    where.metricType = metricType;
  }

  return prisma.analytics.findMany({
    where,
    orderBy: {
      date: 'asc',
    },
  });
}

/**
 * Generate daily scan statistics
 */
export async function generateScanStatistics(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalScans,
    verifiedScans,
    fraudAlerts,
    uniqueBatches,
    uniqueUsers,
  ] = await Promise.all([
    prisma.scanLog.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),
    prisma.scanLog.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        blockchainVerified: true,
      },
    }),
    prisma.fraudAlert.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isResolved: false,
      },
    }),
    prisma.scanLog.groupBy({
      by: ['batchId'],
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),
    prisma.scanLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),
  ]);

  const verificationRate = totalScans > 0 ? (verifiedScans / totalScans) * 100 : 0;

  await recordAnalytics(date, 'TOTAL_SCANS', totalScans, {
    verifiedScans,
    fraudAlerts,
    uniqueBatches: uniqueBatches.length,
    uniqueUsers: uniqueUsers.filter((u) => u.userId).length,
    verificationRate,
  });

  await recordAnalytics(date, 'VERIFICATION_RATE', verificationRate);
  await recordAnalytics(date, 'FRAUD_ALERTS', fraudAlerts);

  return {
    totalScans,
    verifiedScans,
    fraudAlerts,
    uniqueBatches: uniqueBatches.length,
    uniqueUsers: uniqueUsers.filter((u) => u.userId).length,
    verificationRate,
  };
}

/**
 * Generate batch statistics
 */
export async function generateBatchStatistics() {
  const [
    totalBatches,
    validBatches,
    recalledBatches,
    expiredBatches,
    inProduction,
    inTransit,
    atDistributor,
    atPharmacy,
    sold,
  ] = await Promise.all([
    prisma.batch.count(),
    prisma.batch.count({ where: { status: 'VALID' } }),
    prisma.batch.count({ where: { status: 'RECALLED' } }),
    prisma.batch.count({
      where: {
        expiryDate: {
          lt: new Date(),
        },
      },
    }),
    prisma.batch.count({ where: { lifecycleStatus: 'IN_PRODUCTION' } }),
    prisma.batch.count({ where: { lifecycleStatus: 'IN_TRANSIT' } }),
    prisma.batch.count({ where: { lifecycleStatus: 'AT_DISTRIBUTOR' } }),
    prisma.batch.count({ where: { lifecycleStatus: 'AT_PHARMACY' } }),
    prisma.batch.count({ where: { lifecycleStatus: 'SOLD' } }),
  ]);

  return {
    totalBatches,
    validBatches,
    recalledBatches,
    expiredBatches,
    lifecycle: {
      inProduction,
      inTransit,
      atDistributor,
      atPharmacy,
      sold,
    },
  };
}

/**
 * Get fraud statistics
 */
export async function getFraudStatistics(startDate: Date, endDate: Date) {
  const fraudAlerts = await prisma.fraudAlert.groupBy({
    by: ['alertType', 'severity'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  const resolved = await prisma.fraudAlert.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isResolved: true,
    },
  });

  const unresolved = await prisma.fraudAlert.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isResolved: false,
    },
  });

  return {
    byType: fraudAlerts.reduce((acc, item) => {
      acc[item.alertType] = (acc[item.alertType] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: fraudAlerts.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>),
    resolved,
    unresolved,
    total: resolved + unresolved,
  };
}
