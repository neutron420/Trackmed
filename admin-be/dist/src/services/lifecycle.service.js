"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLifecycleStatus = updateLifecycleStatus;
exports.markBatchAsSold = markBatchAsSold;
const database_1 = __importDefault(require("../config/database"));
const audit_trail_service_1 = require("./audit-trail.service");
const notification_service_1 = require("./notification.service");
/**
 * Update batch lifecycle status
 */
async function updateLifecycleStatus(batchId, newStatus, distributorId, pharmacyId, performedBy = 'system', performedByRole) {
    try {
        const batch = await database_1.default.batch.findUnique({
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
        const validTransitions = {
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
        const updateData = {
            lifecycleStatus: newStatus,
        };
        if (distributorId && (newStatus === 'AT_DISTRIBUTOR' || newStatus === 'IN_TRANSIT')) {
            updateData.distributorId = distributorId;
        }
        if (pharmacyId && (newStatus === 'AT_PHARMACY' || newStatus === 'SOLD')) {
            updateData.pharmacyId = pharmacyId;
        }
        const updatedBatch = await database_1.default.batch.update({
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
        await (0, audit_trail_service_1.createAuditTrail)({
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
        await (0, notification_service_1.sendNotification)({
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
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to update lifecycle status',
        };
    }
}
/**
 * Mark batch as sold (decrease remaining quantity)
 */
async function markBatchAsSold(batchId, quantity, performedBy = 'system', performedByRole) {
    try {
        const batch = await database_1.default.batch.findUnique({
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
        const updatedBatch = await database_1.default.batch.update({
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
        await (0, audit_trail_service_1.createAuditTrail)({
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
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to mark batch as sold',
        };
    }
}
//# sourceMappingURL=lifecycle.service.js.map