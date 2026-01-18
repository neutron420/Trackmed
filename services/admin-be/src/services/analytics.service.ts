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
 * Get geographic order data for map
 */
async function getGeographicOrderData() {
  // Get distributors with their locations and shipment counts
  const distributors = await prisma.distributor.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      _count: {
        select: { shipments: true },
      },
    },
  });

  // City coordinates (major Indian cities)
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.076, lng: 72.8777 },
    'Delhi': { lat: 28.6139, lng: 77.209 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Hyderabad': { lat: 17.385, lng: 78.4867 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Surat': { lat: 21.1702, lng: 72.8311 },
    'Kanpur': { lat: 26.4499, lng: 80.3319 },
    'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Indore': { lat: 22.7196, lng: 75.8577 },
    'Thane': { lat: 19.2183, lng: 72.9781 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'Patna': { lat: 25.5941, lng: 85.1376 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 },
    'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Kochi': { lat: 9.9312, lng: 76.2673 },
  };

  // State coordinates (fallback)
  const stateCoordinates: Record<string, { lat: number; lng: number }> = {
    'Maharashtra': { lat: 19.7515, lng: 75.7139 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Karnataka': { lat: 15.3173, lng: 75.7139 },
    'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
    'Gujarat': { lat: 22.2587, lng: 71.1924 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'West Bengal': { lat: 22.9868, lng: 87.855 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Haryana': { lat: 29.0588, lng: 76.0856 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
    'Telangana': { lat: 18.1124, lng: 79.0193 },
    'Andhra Pradesh': { lat: 15.9129, lng: 79.74 },
  };

  const locations = distributors.map((d) => {
    const cityCoord = d.city ? cityCoordinates[d.city] : null;
    const stateCoord = d.state ? stateCoordinates[d.state] : null;
    const coord = cityCoord || stateCoord || { lat: 20.5937, lng: 78.9629 }; // Default: center of India

    return {
      id: d.id,
      name: d.name,
      city: d.city || 'Unknown',
      state: d.state || 'Unknown',
      lat: coord.lat + (Math.random() - 0.5) * 0.5, // Add slight randomization
      lng: coord.lng + (Math.random() - 0.5) * 0.5,
      orders: d._count.shipments,
      size: Math.max(10, Math.min(50, d._count.shipments * 5)), // Size based on orders
    };
  });

  // Also add warehouse location
  locations.push({
    id: 'warehouse',
    name: 'Main Warehouse',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    orders: 0,
    size: 60,
  });

  return locations;
}

