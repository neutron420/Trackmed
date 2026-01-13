"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
/**
 * GET /api/scan/logs
 * Get scan logs with pagination
 */
router.get('/logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            database_1.default.scanLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    qrCode: true,
                    batch: {
                        include: {
                            medicine: true,
                            manufacturer: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            }),
            database_1.default.scanLog.count(),
        ]);
        res.json({
            success: true,
            data: logs,
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
router.get('/logs/:batchId', async (req, res) => {
    try {
        let batchId = req.params.batchId;
        if (Array.isArray(batchId)) {
            batchId = batchId[0];
        }
        const logs = await database_1.default.scanLog.findMany({
            where: { batchId },
            orderBy: { createdAt: 'desc' },
            include: {
                qrCode: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: logs,
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
//# sourceMappingURL=scan.routes.js.map