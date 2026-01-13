"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAnalytics = recordAnalytics;
exports.getAnalytics = getAnalytics;
exports.generateScanStatistics = generateScanStatistics;
exports.generateBatchStatistics = generateBatchStatistics;
exports.getFraudStatistics = getFraudStatistics;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
/**
 * Record analytics metric
 */
async function recordAnalytics(date, metricType, metricValue, metadata) {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return database_1.default.analytics.upsert({
        where: {
            date_metricType: {
                date: dateOnly,
                metricType,
            },
        },
        update: {
            metricValue: new client_1.Prisma.Decimal(metricValue),
            metadata: metadata || {},
        },
        create: {
            date: dateOnly,
            metricType,
            metricValue: new client_1.Prisma.Decimal(metricValue),
            metadata: metadata || {},
        },
    });
}
/**
 * Get analytics for a date range
 */
async function getAnalytics(startDate, endDate, metricType) {
    const where = {
        date: {
            gte: startDate,
            lte: endDate,
        },
    };
    if (metricType) {
        where.metricType = metricType;
    }
    return database_1.default.analytics.findMany({
        where,
        orderBy: {
            date: 'asc',
        },
    });
}
/**
 * Generate daily scan statistics
 */
async function generateScanStatistics(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const [totalScans, verifiedScans, fraudAlerts, uniqueBatches, uniqueUsers,] = await Promise.all([
        database_1.default.scanLog.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        }),
        database_1.default.scanLog.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                blockchainVerified: true,
            },
        }),
        database_1.default.fraudAlert.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                isResolved: false,
            },
        }),
        database_1.default.scanLog.groupBy({
            by: ['batchId'],
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        }),
        database_1.default.scanLog.groupBy({
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
async function generateBatchStatistics() {
    const [totalBatches, validBatches, recalledBatches, expiredBatches, inProduction, inTransit, atDistributor, atPharmacy, sold,] = await Promise.all([
        database_1.default.batch.count(),
        database_1.default.batch.count({ where: { status: 'VALID' } }),
        database_1.default.batch.count({ where: { status: 'RECALLED' } }),
        database_1.default.batch.count({
            where: {
                expiryDate: {
                    lt: new Date(),
                },
            },
        }),
        database_1.default.batch.count({ where: { lifecycleStatus: 'IN_PRODUCTION' } }),
        database_1.default.batch.count({ where: { lifecycleStatus: 'IN_TRANSIT' } }),
        database_1.default.batch.count({ where: { lifecycleStatus: 'AT_DISTRIBUTOR' } }),
        database_1.default.batch.count({ where: { lifecycleStatus: 'AT_PHARMACY' } }),
        database_1.default.batch.count({ where: { lifecycleStatus: 'SOLD' } }),
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
async function getFraudStatistics(startDate, endDate) {
    const fraudAlerts = await database_1.default.fraudAlert.groupBy({
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
    const resolved = await database_1.default.fraudAlert.count({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            isResolved: true,
        },
    });
    const unresolved = await database_1.default.fraudAlert.count({
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
        }, {}),
        bySeverity: fraudAlerts.reduce((acc, item) => {
            acc[item.severity] = (acc[item.severity] || 0) + item._count.id;
            return acc;
        }, {}),
        resolved,
        unresolved,
        total: resolved + unresolved,
    };
}
//# sourceMappingURL=analytics.service.js.map