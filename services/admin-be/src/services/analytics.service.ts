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

/**
 * Get comprehensive dashboard analytics
 */
export async function getDashboardAnalytics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();

  // Get batch statistics
  const batchStats = await generateBatchStatistics();

  // Get scan statistics
  const scanStats = await prisma.scanLog.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
  });

  // Get total scans and verification stats
  const [totalScans, verifiedScans, counterfeitScans] = await Promise.all([
    prisma.scanLog.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    prisma.scanLog.count({
      where: { createdAt: { gte: startDate, lte: endDate }, blockchainVerified: true },
    }),
    prisma.scanLog.count({
      where: { createdAt: { gte: startDate, lte: endDate }, blockchainVerified: false },
    }),
  ]);

  // Get shipment stats
  const [totalShipments, deliveredShipments, pendingShipments] = await Promise.all([
    prisma.shipment.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }).catch(() => 0),
    prisma.shipment.count({
      where: { createdAt: { gte: startDate, lte: endDate }, status: 'DELIVERED' },
    }).catch(() => 0),
    prisma.shipment.count({
      where: { createdAt: { gte: startDate, lte: endDate }, status: 'PENDING' },
    }).catch(() => 0),
  ]);

  // Get total units from batches
  const totalUnits = await prisma.batch.aggregate({
    _sum: { quantity: true },
  });

  // Get production trend (batches created per day)
  const productionTrend = await getProductionTrend(startDate, endDate);

  // Get sales/shipment trend
  const salesTrend = await getSalesTrend(startDate, endDate);

  // Get top products
  const topProducts = await getTopProducts();

  // Get regional data
  const regionalData = await getRegionalData();

  // Get category distribution
  const categoryDistribution = await getCategoryDistribution();

  // Get geographic order data
  const geographicData = await getGeographicOrderData();

  return {
    success: true,
    data: {
      summary: {
        totalBatches: batchStats.totalBatches,
        totalUnits: totalUnits._sum.quantity || 0,
        totalScans,
        verifiedScans,
        counterfeitScans,
        verificationRate: totalScans > 0 ? ((verifiedScans / totalScans) * 100).toFixed(1) : 0,
        totalShipments,
        deliveredShipments,
        pendingShipments,
      },
      batchStats,
      productionTrend,
      salesTrend,
      topProducts,
      regionalData,
      categoryDistribution,
      geographicData,
    },
  };
}

/**
 * Get production trend (batches created per day)
 */
async function getProductionTrend(startDate: Date, endDate: Date) {
  const batches = await prisma.batch.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      createdAt: true,
      quantity: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const groupedByDay = batches.reduce((acc: Record<string, number>, batch) => {
    const day = batch.createdAt.toISOString().split('T')[0] as string;
    acc[day] = (acc[day] || 0) + (batch.quantity || 0);
    return acc;
  }, {});

  // Convert to array format for charts
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    const dateKey = date.toISOString().split('T')[0] as string;
    last7Days.push({
      label: dayName,
      value: groupedByDay[dateKey] || 0,
      date: dateKey,
    });
  }

  return last7Days;
}

/**
 * Get sales/shipment trend
 */
async function getSalesTrend(startDate: Date, endDate: Date) {
  const shipments = await prisma.shipment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      createdAt: true,
      quantity: true,
    },
    orderBy: { createdAt: 'asc' },
  }).catch(() => []);

  // Group by day
  const groupedByDay = (shipments as any[]).reduce((acc: Record<string, number>, shipment) => {
    const day = shipment.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + (shipment.quantity || 0);
    return acc;
  }, {});

  // Convert to array format for charts
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    const dateKey = date.toISOString().split('T')[0] as string;
    last7Days.push({
      label: dayName,
      value: groupedByDay[dateKey] || 0,
      date: dateKey,
    });
  }

  return last7Days;
}

/**
 * Get top products by batch quantity
 */
async function getTopProducts() {
  const medicines = await prisma.medicine.findMany({
    include: {
      batches: {
        select: { quantity: true },
      },
    },
  });

  const productsWithUnits = medicines.map((med) => ({
    name: `${med.name} ${med.strength}`,
    units: med.batches.reduce((sum, b) => sum + (b.quantity || 0), 0),
    batchCount: med.batches.length,
  }));

  // Sort by units and return top 5
  return productsWithUnits
    .sort((a, b) => b.units - a.units)
    .slice(0, 5)
    .map((p, i) => ({
      ...p,
      rank: i + 1,
      growth: `+${Math.floor(Math.random() * 15 + 5)}%`, // TODO: Calculate real growth
    }));
}

/**
 * Get regional data based on distributors and shipments
 */
async function getRegionalData() {
  const distributors = await prisma.distributor.findMany({
    select: {
      state: true,
      city: true,
      _count: {
        select: { shipments: true, batches: true },
      },
    },
  });

  // Group by region (North/South/East/West based on state)
  const regionMap: Record<string, string> = {
    'Delhi': 'North', 'Punjab': 'North', 'Haryana': 'North', 'Uttar Pradesh': 'North',
    'Rajasthan': 'North', 'Himachal Pradesh': 'North', 'Uttarakhand': 'North',
    'Jammu and Kashmir': 'North', 'Ladakh': 'North', 'Chandigarh': 'North',
    'Tamil Nadu': 'South', 'Kerala': 'South', 'Karnataka': 'South', 'Andhra Pradesh': 'South',
    'Telangana': 'South', 'Puducherry': 'South',
    'West Bengal': 'East', 'Bihar': 'East', 'Jharkhand': 'East', 'Odisha': 'East',
    'Assam': 'East', 'Sikkim': 'East', 'Arunachal Pradesh': 'East', 'Nagaland': 'East',
    'Manipur': 'East', 'Mizoram': 'East', 'Tripura': 'East', 'Meghalaya': 'East',
    'Maharashtra': 'West', 'Gujarat': 'West', 'Goa': 'West', 'Madhya Pradesh': 'West',
    'Chhattisgarh': 'West',
  };

  const regionData: Record<string, { orders: number; batches: number }> = {
    North: { orders: 0, batches: 0 },
    South: { orders: 0, batches: 0 },
    East: { orders: 0, batches: 0 },
    West: { orders: 0, batches: 0 },
  };

  distributors.forEach((d) => {
    const region = regionMap[d.state || ''] || 'Other';
    if (regionData[region]) {
      regionData[region].orders += d._count.shipments;
      regionData[region].batches += d._count.batches;
    }
  });

  return Object.entries(regionData).map(([region, data]) => ({
    region,
    orders: data.orders,
    batches: data.batches,
    revenue: `₹${((data.orders * 10000) / 100000).toFixed(1)}L`, // Estimated
  }));
}

/**
 * Get category distribution
 */
async function getCategoryDistribution() {
  const medicines = await prisma.medicine.groupBy({
    by: ['dosageForm'],
    _count: { id: true },
  });

  return medicines.map((m) => ({
    label: m.dosageForm || 'Other',
    value: m._count.id,
  }));
}

/**
 * Get geographic order data for map - STATE-WISE AGGREGATION
 */
async function getGeographicOrderData() {
  // State coordinates (capital cities)
  const stateCoordinates: Record<string, { lat: number; lng: number; capital: string }> = {
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, capital: 'Amaravati' },
    'Arunachal Pradesh': { lat: 27.0844, lng: 93.6053, capital: 'Itanagar' },
    'Assam': { lat: 26.1445, lng: 91.7362, capital: 'Dispur' },
    'Bihar': { lat: 25.6093, lng: 85.1376, capital: 'Patna' },
    'Chhattisgarh': { lat: 21.2514, lng: 81.6296, capital: 'Raipur' },
    'Goa': { lat: 15.4909, lng: 73.8278, capital: 'Panaji' },
    'Gujarat': { lat: 23.2156, lng: 72.6369, capital: 'Gandhinagar' },
    'Haryana': { lat: 29.0588, lng: 76.0856, capital: 'Chandigarh' },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, capital: 'Shimla' },
    'Jharkhand': { lat: 23.3441, lng: 85.3096, capital: 'Ranchi' },
    'Karnataka': { lat: 12.9716, lng: 77.5946, capital: 'Bengaluru' },
    'Kerala': { lat: 8.5241, lng: 76.9366, capital: 'Thiruvananthapuram' },
    'Madhya Pradesh': { lat: 23.2599, lng: 77.4126, capital: 'Bhopal' },
    'Maharashtra': { lat: 19.0760, lng: 72.8777, capital: 'Mumbai' },
    'Manipur': { lat: 24.8170, lng: 93.9368, capital: 'Imphal' },
    'Meghalaya': { lat: 25.5788, lng: 91.8933, capital: 'Shillong' },
    'Mizoram': { lat: 23.7271, lng: 92.7176, capital: 'Aizawl' },
    'Nagaland': { lat: 25.6751, lng: 94.1086, capital: 'Kohima' },
    'Odisha': { lat: 20.2961, lng: 85.8245, capital: 'Bhubaneswar' },
    'Punjab': { lat: 30.7333, lng: 76.7794, capital: 'Chandigarh' },
    'Rajasthan': { lat: 26.9124, lng: 75.7873, capital: 'Jaipur' },
    'Sikkim': { lat: 27.3389, lng: 88.6065, capital: 'Gangtok' },
    'Tamil Nadu': { lat: 13.0827, lng: 80.2707, capital: 'Chennai' },
    'Telangana': { lat: 17.3850, lng: 78.4867, capital: 'Hyderabad' },
    'Tripura': { lat: 23.8315, lng: 91.2868, capital: 'Agartala' },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, capital: 'Lucknow' },
    'Uttarakhand': { lat: 30.3165, lng: 78.0322, capital: 'Dehradun' },
    'West Bengal': { lat: 22.5726, lng: 88.3639, capital: 'Kolkata' },
    'Delhi': { lat: 28.6139, lng: 77.2090, capital: 'New Delhi' },
    'Chandigarh': { lat: 30.7333, lng: 76.7794, capital: 'Chandigarh' },
    'Puducherry': { lat: 11.9416, lng: 79.8083, capital: 'Puducherry' },
    'Ladakh': { lat: 34.1526, lng: 77.5771, capital: 'Leh' },
    'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973, capital: 'Srinagar' },
  };

  // Get all entities with their state info
  const [distributors, manufacturers, pharmacies] = await Promise.all([
    prisma.distributor.findMany({
      select: {
        state: true,
        _count: { select: { shipments: true, batches: true } },
      },
    }),
    prisma.manufacturer.findMany({
      select: {
        state: true,
        _count: { select: { batches: true } },
      },
    }).catch(() => []),
    prisma.pharmacy.findMany({
      select: {
        state: true,
        _count: { select: { batches: true } },
      },
    }).catch(() => []),
  ]);

  // Aggregate by state
  const stateAggregation: Record<string, { entities: number; shipments: number; batches: number }> = {};

  distributors.forEach((d: any) => {
    const state = d.state || '';
    if (state && stateCoordinates[state]) {
      if (!stateAggregation[state]) {
        stateAggregation[state] = { entities: 0, shipments: 0, batches: 0 };
      }
      stateAggregation[state].entities += 1;
      stateAggregation[state].shipments += d._count?.shipments || 0;
      stateAggregation[state].batches += d._count?.batches || 0;
    }
  });

  (manufacturers as any[]).forEach((m: any) => {
    const state = m.state || '';
    if (state && stateCoordinates[state]) {
      if (!stateAggregation[state]) {
        stateAggregation[state] = { entities: 0, shipments: 0, batches: 0 };
      }
      stateAggregation[state].entities += 1;
      stateAggregation[state].batches += m._count?.batches || 0;
    }
  });

  (pharmacies as any[]).forEach((p: any) => {
    const state = p.state || '';
    if (state && stateCoordinates[state]) {
      if (!stateAggregation[state]) {
        stateAggregation[state] = { entities: 0, shipments: 0, batches: 0 };
      }
      stateAggregation[state].entities += 1;
      stateAggregation[state].batches += p._count?.batches || 0;
    }
  });

  // Convert to geographic data format
  const locations = Object.entries(stateAggregation)
    .filter(([state]) => stateCoordinates[state])
    .map(([state, data]) => {
      const coord = stateCoordinates[state]!;
      const totalActivity = data.entities + data.shipments + data.batches;
      return {
        id: state,
        name: state,
        city: coord.capital,
        state: state,
        lat: coord.lat,
        lng: coord.lng,
        orders: totalActivity,
        size: Math.max(12, Math.min(50, totalActivity * 3)),
      };
    })
    .sort((a, b) => b.orders - a.orders);

  return locations;
}

