import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get comprehensive admin dashboard statistics
 */
export async function getAdminStats() {
  try {
    // Get user counts
    const [totalUsers, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    // Get manufacturer, distributor, and pharmacy counts
    const [manufacturers, distributors, pharmacies] = await Promise.all([
      prisma.manufacturer.count(),
      prisma.distributor.count(),
      prisma.pharmacy.count(),
    ]);

    // Get batch statistics
    const [totalBatches, activeBatches, recalledBatches, expiredBatches] = await Promise.all([
      prisma.batch.count(),
      prisma.batch.count({ where: { status: 'VALID' } }),
      prisma.batch.count({ where: { status: 'RECALLED' } }),
      prisma.batch.count({ where: { expiryDate: { lt: new Date() } } }),
    ]);

    // Get shipment statistics
    const [totalShipments, deliveredShipments, inTransitShipments, pendingShipments] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { status: { in: ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } } }),
      prisma.shipment.count({ where: { status: 'PENDING' } }),
    ]);

    // Get scan statistics
    const [totalScans, verifiedScans, failedScans] = await Promise.all([
      prisma.scanLog.count(),
      prisma.scanLog.count({ where: { blockchainVerified: true } }),
      prisma.scanLog.count({ where: { blockchainVerified: false } }),
    ]);

    // Get fraud alerts
    const fraudAlerts = await prisma.fraudAlert.count({ where: { isResolved: false } });

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          manufacturers,
          distributors,
          pharmacies,
          admins: adminUsers,
        },
        batches: {
          total: totalBatches,
          active: activeBatches,
          recalled: recalledBatches,
          expired: expiredBatches,
        },
        shipments: {
          total: totalShipments,
          delivered: deliveredShipments,
          inTransit: inTransitShipments,
          pending: pendingShipments,
        },
        scans: {
          total: totalScans,
          verified: verifiedScans,
          failed: failedScans,
        },
        fraudAlerts,
      },
    };
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    return {
      success: false,
      error: error.message || 'Failed to get admin statistics',
    };
  }
}
