"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
/**
 * GET /api/fraud/alerts
 * Get fraud alerts with pagination
 */
router.get('/alerts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const resolved = req.query.resolved === 'true';
        const [alerts, total] = await Promise.all([
            database_1.default.fraudAlert.findMany({
                where: { isResolved: resolved },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            }),
            database_1.default.fraudAlert.count({ where: { isResolved: resolved } }),
        ]);
        res.json({
            success: true,
            data: alerts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
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
 * POST /api/fraud/alerts
 * Create a fraud alert
 */
router.post('/alerts', async (req, res) => {
    try {
        const { batchId, qrCodeId, userId, alertType, severity, description, evidence, } = req.body;
        if (!alertType || !description) {
            return res.status(400).json({
                success: false,
                error: 'Alert type and description are required',
            });
        }
        const alert = await database_1.default.fraudAlert.create({
            data: {
                batchId,
                qrCodeId,
                userId,
                alertType,
                severity: severity || 'MEDIUM',
                description,
                evidence: evidence || {},
            },
        });
        res.status(201).json({
            success: true,
            data: alert,
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
 * PATCH /api/fraud/alerts/:id/resolve
 * Resolve a fraud alert
 */
router.patch('/alerts/:id/resolve', async (req, res) => {
    try {
        let { id } = req.params;
        const { resolvedBy } = req.body;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const alert = await database_1.default.fraudAlert.update({
            where: { id },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                resolvedBy,
            },
        });
        res.json({
            success: true,
            data: alert,
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
//# sourceMappingURL=fraud.routes.js.map