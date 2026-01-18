import prisma from '../config/database';
import { createAuditTrail } from './audit-trail.service';

// Define types locally (matches Prisma schema)
export type ReportType = 'PRODUCTION' | 'INVENTORY' | 'SALES' | 'QUALITY' | 'VERIFICATION' | 'EXPIRY' | 'DISTRIBUTOR' | 'BATCH_SUMMARY' | 'FRAUD_ANALYSIS';
export type ReportStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';

// Generate unique report number
function generateReportNumber(type: ReportType): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RPT-${type.substring(0, 3)}-${year}${month}${day}-${random}`;
}

// Create a new report
export async function createReport(data: {
  name: string;
  type: ReportType;
  parameters?: any;
  format?: string;
  generatedBy: string;
}) {
  try {
    const report = await prisma.report.create({
      data: {
        reportNumber: generateReportNumber(data.type),
        name: data.name,
        type: data.type,
        parameters: data.parameters,
        format: data.format || 'PDF',
        generatedBy: data.generatedBy,
        status: 'PENDING',
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'REPORT',
      entityId: report.id,
      action: 'CREATE',
      performedBy: data.generatedBy,
      metadata: { reportNumber: report.reportNumber, type: data.type },
    });

    return { success: true, report };
  } catch (error: any) {
    console.error('Error creating report:', error);
    return { success: false, error: error.message };
  }
}

// Generate report data based on type
export async function generateReportData(reportId: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    // Update status to generating
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'GENERATING',
        startedAt: new Date(),
      },
    });

    let reportData: any;
    const params = report.parameters as any || {};

    try {
      switch (report.type) {
        case 'PRODUCTION':
          reportData = await generateProductionReport(params);
          break;
        case 'INVENTORY':
          reportData = await generateInventoryReport(params);
          break;
        case 'SALES':
          reportData = await generateSalesReport(params);
          break;
        case 'QUALITY':
          reportData = await generateQualityReport(params);
          break;
        case 'VERIFICATION':
          reportData = await generateVerificationReport(params);
          break;
        case 'EXPIRY':
          reportData = await generateExpiryReport(params);
          break;
        case 'DISTRIBUTOR':
          reportData = await generateDistributorReport(params);
          break;
        case 'BATCH_SUMMARY':
          reportData = await generateBatchSummaryReport(params);
          break;
        case 'FRAUD_ANALYSIS':
          reportData = await generateFraudAnalysisReport(params);
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Update report with completed status
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          fileUrl: `/api/report/${reportId}/download`,
        },
      });

      return { success: true, report: updatedReport, data: reportData };
    } catch (error: any) {
      // Update report with failed status
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  } catch (error: any) {
    console.error('Error generating report:', error);
    return { success: false, error: error.message };
  }
}

// Production Report
async function generateProductionReport(params: any) {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  const batches = await prisma.batch.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      medicine: true,
      manufacturer: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const summary = {
    totalBatches: batches.length,
    totalQuantity: batches.reduce((sum, b) => sum + b.quantity, 0),
    byStatus: {} as Record<string, number>,
    byMedicine: {} as Record<string, number>,
  };

  batches.forEach((batch) => {
    summary.byStatus[batch.status] = (summary.byStatus[batch.status] || 0) + 1;
    summary.byMedicine[batch.medicine.name] = (summary.byMedicine[batch.medicine.name] || 0) + batch.quantity;
  });

  return {
    reportType: 'PRODUCTION',
    period: { startDate, endDate },
    summary,
    batches: batches.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      quantity: b.quantity,
      status: b.status,
      manufacturingDate: b.manufacturingDate,
      expiryDate: b.expiryDate,
    })),
  };
}

// Inventory Report
async function generateInventoryReport(params: any) {
  const batches = await prisma.batch.findMany({
    where: {
      lifecycleStatus: { notIn: ['SOLD', 'RECALLED'] },
    },
    include: {
      medicine: true,
      manufacturer: true,
    },
    orderBy: { expiryDate: 'asc' },
  });

  const medicines = await prisma.medicine.findMany();

  const inventorySummary = medicines.map((med) => {
    const medBatches = batches.filter((b) => b.medicineId === med.id);
    return {
      medicine: med.name,
      strength: med.strength,
      totalBatches: medBatches.length,
      totalQuantity: medBatches.reduce((sum, b) => sum + b.remainingQuantity, 0),
      lowStock: medBatches.reduce((sum, b) => sum + b.remainingQuantity, 0) < 100,
    };
  });

  return {
    reportType: 'INVENTORY',
    generatedAt: new Date(),
    summary: {
      totalMedicines: medicines.length,
      totalBatches: batches.length,
      totalUnits: batches.reduce((sum, b) => sum + b.remainingQuantity, 0),
      lowStockItems: inventorySummary.filter((i) => i.lowStock).length,
    },
    inventory: inventorySummary,
    batchDetails: batches.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      remainingQuantity: b.remainingQuantity,
      expiryDate: b.expiryDate,
      lifecycleStatus: b.lifecycleStatus,
    })),
  };
}

// Sales Report
async function generateSalesReport(params: any) {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
    },
    include: {
      items: {
        include: { batch: { include: { medicine: true } } },
      },
    },
  });

  const shipments = await prisma.shipment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'DELIVERED',
    },
    include: {
      batch: { include: { medicine: true } },
      distributor: true,
    },
  });

  return {
    reportType: 'SALES',
    period: { startDate, endDate },
    summary: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
      totalShipments: shipments.length,
      totalUnitsShipped: shipments.reduce((sum: number, s: any) => sum + s.quantity, 0),
    },
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
    shipments: shipments.map((s: any) => ({
      shipmentNumber: s.shipmentNumber,
      distributor: s.distributor.name,
      medicine: s.batch.medicine.name,
      quantity: s.quantity,
      deliveredAt: s.deliveredAt,
    })),
  };
}

// Quality Report
async function generateQualityReport(params: any) {
  const batches = await prisma.batch.findMany({
    include: { medicine: true, manufacturer: true },
  });

  const recalledBatches = batches.filter((b) => b.status === 'RECALLED');
  const fraudAlerts = await prisma.fraudAlert.findMany({
    where: { isResolved: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return {
    reportType: 'QUALITY',
    generatedAt: new Date(),
    summary: {
      totalBatches: batches.length,
      recalledBatches: recalledBatches.length,
      recallRate: ((recalledBatches.length / batches.length) * 100).toFixed(2),
      openFraudAlerts: fraudAlerts.length,
    },
    recalls: recalledBatches.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      manufacturer: b.manufacturer.name,
      recalledAt: b.updatedAt,
    })),
    fraudAlerts: fraudAlerts.map((f) => ({
      id: f.id,
      type: f.alertType,
      severity: f.severity,
      description: f.description,
      createdAt: f.createdAt,
    })),
  };
}

// Verification Report
async function generateVerificationReport(params: any) {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  const scanLogs = await prisma.scanLog.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      batch: { include: { medicine: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const verifiedScans = scanLogs.filter((s) => s.blockchainVerified);
  const failedScans = scanLogs.filter((s) => !s.blockchainVerified);

  return {
    reportType: 'VERIFICATION',
    period: { startDate, endDate },
    summary: {
      totalScans: scanLogs.length,
      verifiedScans: verifiedScans.length,
      failedScans: failedScans.length,
      verificationRate: ((verifiedScans.length / scanLogs.length) * 100).toFixed(2),
      byType: {} as Record<string, number>,
    },
    scanDetails: scanLogs.slice(0, 100).map((s) => ({
      id: s.id,
      batchNumber: s.batch?.batchNumber,
      medicine: s.batch?.medicine?.name,
      verified: s.blockchainVerified,
      scanType: s.scanType,
      createdAt: s.createdAt,
    })),
  };
}

// Expiry Report
async function generateExpiryReport(params: any) {
  const daysAhead = params.daysAhead || 90;
  const expiryDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

  const expiringBatches = await prisma.batch.findMany({
    where: {
      expiryDate: { lte: expiryDate },
      lifecycleStatus: { notIn: ['SOLD', 'RECALLED', 'EXPIRED'] },
    },
    include: {
      medicine: true,
      manufacturer: true,
    },
    orderBy: { expiryDate: 'asc' },
  });

  const expiredBatches = expiringBatches.filter((b) => b.expiryDate < new Date());
  const nearExpiry = expiringBatches.filter((b) => b.expiryDate >= new Date());

  return {
    reportType: 'EXPIRY',
    generatedAt: new Date(),
    parameters: { daysAhead },
    summary: {
      totalExpiring: expiringBatches.length,
      alreadyExpired: expiredBatches.length,
      expiringWithin90Days: nearExpiry.length,
      totalUnitsAtRisk: expiringBatches.reduce((sum, b) => sum + b.remainingQuantity, 0),
    },
    expired: expiredBatches.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      expiryDate: b.expiryDate,
      remainingQuantity: b.remainingQuantity,
    })),
    nearExpiry: nearExpiry.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      expiryDate: b.expiryDate,
      remainingQuantity: b.remainingQuantity,
      daysUntilExpiry: Math.ceil((b.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })),
  };
}

// Distributor Report
async function generateDistributorReport(params: any) {
  const distributors = await prisma.distributor.findMany({
    include: {
      batches: {
        include: { medicine: true },
      },
      shipments: {
        include: { batch: { include: { medicine: true } } },
      },
    },
  }) as any[];

  return {
    reportType: 'DISTRIBUTOR',
    generatedAt: new Date(),
    summary: {
      totalDistributors: distributors.length,
      verified: distributors.filter((d: any) => d.isVerified).length,
      unverified: distributors.filter((d: any) => !d.isVerified).length,
    },
    distributors: distributors.map((d: any) => ({
      name: d.name,
      licenseNumber: d.licenseNumber,
      city: d.city,
      isVerified: d.isVerified,
      totalBatches: d.batches?.length || 0,
      totalShipments: d.shipments?.length || 0,
      deliveredShipments: d.shipments?.filter((s: any) => s.status === 'DELIVERED').length || 0,
    })),
  };
}

// Batch Summary Report
async function generateBatchSummaryReport(params: any) {
  const batches = await prisma.batch.findMany({
    include: {
      medicine: true,
      manufacturer: true,
      qrCodes: true,
      scanLogs: true,
    },
  });

  return {
    reportType: 'BATCH_SUMMARY',
    generatedAt: new Date(),
    summary: {
      totalBatches: batches.length,
      byStatus: {
        valid: batches.filter((b) => b.status === 'VALID').length,
        recalled: batches.filter((b) => b.status === 'RECALLED').length,
      },
      byLifecycle: batches.reduce((acc, b) => {
        acc[b.lifecycleStatus] = (acc[b.lifecycleStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalQRCodes: batches.reduce((sum, b) => sum + b.qrCodes.length, 0),
      totalScans: batches.reduce((sum, b) => sum + b.scanLogs.length, 0),
    },
    batches: batches.map((b) => ({
      batchNumber: b.batchNumber,
      medicine: b.medicine.name,
      manufacturer: b.manufacturer.name,
      quantity: b.quantity,
      remainingQuantity: b.remainingQuantity,
      status: b.status,
      lifecycleStatus: b.lifecycleStatus,
      qrCodes: b.qrCodes.length,
      scans: b.scanLogs.length,
      manufacturingDate: b.manufacturingDate,
      expiryDate: b.expiryDate,
    })),
  };
}

// Fraud Analysis Report
async function generateFraudAnalysisReport(params: any) {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  const fraudAlerts = await prisma.fraudAlert.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  const byType = fraudAlerts.reduce((acc, f) => {
    acc[f.alertType] = (acc[f.alertType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySeverity = fraudAlerts.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    reportType: 'FRAUD_ANALYSIS',
    period: { startDate, endDate },
    summary: {
      totalAlerts: fraudAlerts.length,
      resolved: fraudAlerts.filter((f) => f.isResolved).length,
      unresolved: fraudAlerts.filter((f) => !f.isResolved).length,
      byType,
      bySeverity,
    },
    alerts: fraudAlerts.map((f) => ({
      id: f.id,
      type: f.alertType,
      severity: f.severity,
      description: f.description,
      isResolved: f.isResolved,
      createdAt: f.createdAt,
      resolvedAt: f.resolvedAt,
    })),
  };
}

// Get all reports
export async function getReports(filters?: {
  type?: ReportType;
  status?: ReportStatus;
  generatedBy?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.generatedBy) {
      where.generatedBy = filters.generatedBy;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return {
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('Error getting reports:', error);
    return { success: false, error: error.message };
  }
}

// Get report by ID
export async function getReportById(id: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    return { success: true, report };
  } catch (error: any) {
    console.error('Error getting report:', error);
    return { success: false, error: error.message };
  }
}

// Delete report
export async function deleteReport(id: string, deletedBy: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    await prisma.report.delete({
      where: { id },
    });

    await createAuditTrail({
      entityType: 'REPORT',
      entityId: id,
      action: 'DELETE',
      performedBy: deletedBy,
      metadata: { reportNumber: report.reportNumber },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting report:', error);
    return { success: false, error: error.message };
  }
}

// Get report statistics
export async function getReportStats() {
  try {
    const [total, completed, pending, failed] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'COMPLETED' } }),
      prisma.report.count({ where: { status: { in: ['PENDING', 'GENERATING'] } } }),
      prisma.report.count({ where: { status: 'FAILED' } }),
    ]);

    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const byType = await prisma.report.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    return {
      success: true,
      data: {
        total,
        completed,
        pending,
        failed,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        recentReports,
      },
    };
  } catch (error: any) {
    console.error('Error getting report stats:', error);
    return { success: false, error: error.message };
  }
}
