"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_trail_service_1 = require("../services/audit-trail.service");
const router = (0, express_1.Router)();
/**
 * GET /api/audit-trail
 * Get audit trails with pagination
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const entityType = req.query.entityType;
        const entityId = req.query.entityId;
        const result = await (0, audit_trail_service_1.getAuditTrails)(page, limit, entityType, entityId);
        res.json({
            success: true,
            data: result.trails,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});
/**
 * GET /api/audit-trail/:entityType/:entityId
 * Get audit trail for a specific entity
 */
router.get('/:entityType/:entityId', async (req, res) => {
    try {
        const { entityType } = req.params;
        let entityId = req.params.entityId;
        if (Array.isArray(entityId)) {
            entityId = entityId[0];
        }
        if (!entityId) {
            return res.status(400).json({
                success: false,
                error: 'Entity ID is required',
            });
        }
        const trails = await (0, audit_trail_service_1.getAuditTrail)(entityType, entityId);
        res.json({
            success: true,
            data: trails,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=audit-trail.routes.js.map