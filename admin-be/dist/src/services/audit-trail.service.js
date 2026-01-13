"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditTrail = createAuditTrail;
exports.getAuditTrail = getAuditTrail;
exports.getAuditTrails = getAuditTrails;
const database_1 = __importDefault(require("../config/database"));
/**
 * Create an audit trail entry
 */
async function createAuditTrail(params) {
    return database_1.default.auditTrail.create({
        data: {
            entityType: params.entityType,
            entityId: params.entityId,
            action: params.action,
            fieldName: params.fieldName,
            oldValue: params.oldValue,
            newValue: params.newValue,
            performedBy: params.performedBy,
            performedByRole: params.performedByRole,
            metadata: params.metadata || {},
        },
    });
}
/**
 * Get audit trail for an entity
 */
async function getAuditTrail(entityType, entityId) {
    return database_1.default.auditTrail.findMany({
        where: {
            entityType,
            entityId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}
/**
 * Get audit trail with pagination
 */
async function getAuditTrails(page = 1, limit = 20, entityType, entityId) {
    const skip = (page - 1) * limit;
    const where = {};
    if (entityType)
        where.entityType = entityType;
    if (entityId)
        where.entityId = entityId;
    const [trails, total] = await Promise.all([
        database_1.default.auditTrail.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.auditTrail.count({ where }),
    ]);
    return {
        trails,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=audit-trail.service.js.map