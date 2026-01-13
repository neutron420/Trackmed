"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
/**
 * GET /api/batch-search
 * Advanced batch search with filters
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { batchNumber, batchHash, manufacturerId, medicineId, status, lifecycleStatus, distributorId, pharmacyId, startDate, endDate, expiryStartDate, expiryEndDate, search, } = req.query;
        const where = {};
        if (batchNumber) {
            where.batchNumber = { contains: batchNumber, mode: 'insensitive' };
        }
        if (batchHash) {
            where.batchHash = batchHash;
        }
        if (manufacturerId) {
            where.manufacturerId = manufacturerId;
        }
        if (medicineId) {
            where.medicineId = medicineId;
        }
        if (status) {
            where.status = status;
        }
        if (lifecycleStatus) {
            where.lifecycleStatus = lifecycleStatus;
        }
        if (distributorId) {
            where.distributorId = distributorId;
        }
        if (pharmacyId) {
            where.pharmacyId = pharmacyId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        if (expiryStartDate || expiryEndDate) {
            where.expiryDate = {};
            if (expiryStartDate) {
                where.expiryDate.gte = new Date(expiryStartDate);
            }
            if (expiryEndDate) {
                where.expiryDate.lte = new Date(expiryEndDate);
            }
        }
        // General search across multiple fields
        if (search) {
            where.OR = [
                { batchNumber: { contains: search, mode: 'insensitive' } },
                { batchHash: { contains: search, mode: 'insensitive' } },
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [batches, total] = await Promise.all([
            database_1.default.batch.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    manufacturer: {
                        select: {
                            id: true,
                            name: true,
                            licenseNumber: true,
                        },
                    },
                    medicine: {
                        select: {
                            id: true,
                            name: true,
                            genericName: true,
                            strength: true,
                        },
                    },
                    distributor: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    pharmacy: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            qrCodes: true,
                            scanLogs: true,
                        },
                    },
                },
            }),
            database_1.default.batch.count({ where }),
        ]);
        res.json({
            success: true,
            data: batches,
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
exports.default = router;
//# sourceMappingURL=batch-search.routes.js.map