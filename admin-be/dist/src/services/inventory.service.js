"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLowStock = checkLowStock;
exports.checkExpiringBatches = checkExpiringBatches;
exports.getInventorySummary = getInventorySummary;
exports.getInventoryByManufacturer = getInventoryByManufacturer;
exports.getInventoryByMedicine = getInventoryByMedicine;
exports.markExpiredBatches = markExpiredBatches;
const database_1 = __importDefault(require("../config/database"));
const notification_service_1 = require("./notification.service");
const audit_trail_service_1 = require("./audit-trail.service");
/**
 * Check for low stock batches
 */
async function checkLowStock(threshold = 10) {
    const lowStockBatches = await database_1.default.batch.findMany({
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
        await (0, notification_service_1.sendLowStockNotification)(batch.id, batch.batchNumber, batch.remainingQuantity);
    }
    return lowStockBatches;
}
/**
 * Check for expiring batches
 */
async function checkExpiringBatches(daysAhead = 30) {
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysAhead);
    const expiringBatches = await database_1.default.batch.findMany({
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
        const daysUntilExpiry = Math.ceil((batch.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        await (0, notification_service_1.sendExpiryWarning)(batch.id, batch.batchNumber, daysUntilExpiry);
    }
    return expiringBatches;
}
/**
 * Get inventory summary
 */
async function getInventorySummary() {
    const [totalBatches, totalQuantity, totalRemaining, lowStockCount, expiringCount, expiredCount,] = await Promise.all([
        database_1.default.batch.count({
            where: {
                lifecycleStatus: {
                    notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
                },
            },
        }),
        database_1.default.batch.aggregate({
            where: {
                lifecycleStatus: {
                    notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
                },
            },
            _sum: {
                quantity: true,
            },
        }),
        database_1.default.batch.aggregate({
            where: {
                lifecycleStatus: {
                    notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
                },
            },
            _sum: {
                remainingQuantity: true,
            },
        }),
        database_1.default.batch.count({
            where: {
                remainingQuantity: {
                    lte: 10,
                },
                lifecycleStatus: {
                    notIn: ['SOLD', 'EXPIRED', 'RECALLED'],
                },
            },
        }),
        database_1.default.batch.count({
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
        database_1.default.batch.count({
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
        soldQuantity: (totalQuantity._sum.quantity || 0) - (totalRemaining._sum.remainingQuantity || 0),
    };
}
/**
 * Get inventory by manufacturer
 */
async function getInventoryByManufacturer() {
    return database_1.default.batch.groupBy({
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
async function getInventoryByMedicine() {
    return database_1.default.batch.groupBy({
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
async function markExpiredBatches() {
    const expiredBatches = await database_1.default.batch.findMany({
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
        await database_1.default.batch.update({
            where: { id: batch.id },
            data: {
                lifecycleStatus: 'EXPIRED',
            },
        });
        // Create audit trail
        await (0, audit_trail_service_1.createAuditTrail)({
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
//# sourceMappingURL=inventory.service.js.map