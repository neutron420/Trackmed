"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const audit_trail_service_1 = require("../services/audit-trail.service");
const router = (0, express_1.Router)();
/**
 * GET /api/distributor
 * Get all distributors with pagination
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { licenseNumber: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [distributors, total] = await Promise.all([
            database_1.default.distributor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { batches: true },
                    },
                },
            }),
            database_1.default.distributor.count({ where }),
        ]);
        res.json({
            success: true,
            data: distributors,
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
 * GET /api/distributor/:id
 * Get distributor by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const distributorId = Array.isArray(id) ? id[0] : id;
        const distributor = await database_1.default.distributor.findUnique({
            where: { id: distributorId },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!distributor) {
            return res.status(404).json({
                success: false,
                error: 'Distributor not found',
            });
        }
        res.json({
            success: true,
            data: distributor,
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
 * POST /api/distributor
 * Create a new distributor
 */
router.post('/', async (req, res) => {
    try {
        const { name, licenseNumber, address, city, state, country, phone, email, gstNumber, } = req.body;
        if (!name || !licenseNumber || !address) {
            return res.status(400).json({
                success: false,
                error: 'Name, license number, and address are required',
            });
        }
        // Check if license number already exists
        const existing = await database_1.default.distributor.findUnique({
            where: { licenseNumber },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Distributor with this license number already exists',
            });
        }
        const distributor = await database_1.default.distributor.create({
            data: {
                name,
                licenseNumber,
                address,
                city,
                state,
                country: country || 'India',
                phone,
                email,
                gstNumber,
                isVerified: false,
            },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'DISTRIBUTOR',
            entityId: distributor.id,
            action: 'CREATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { distributorData: distributor },
        });
        res.status(201).json({
            success: true,
            data: distributor,
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
 * PATCH /api/distributor/:id
 * Update distributor
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const distributorId = Array.isArray(id) ? id[0] : id;
        const existing = await database_1.default.distributor.findUnique({
            where: { id: distributorId },
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Distributor not found',
            });
        }
        // Don't allow updating license number
        delete updateData.licenseNumber;
        const normalizedId = Array.isArray(id) ? id[0] : id;
        const distributor = await database_1.default.distributor.update({
            where: { id: normalizedId },
            data: updateData,
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'DISTRIBUTOR',
            entityId: distributorId ?? '',
            action: 'UPDATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { updateData, previousData: existing },
        });
        res.json({
            success: true,
            data: distributor,
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
 * PATCH /api/distributor/:id/verify
 * Verify/unverify distributor
 */
router.patch('/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;
        const distributorId = Array.isArray(id) ? id[0] : id;
        if (!distributorId) {
            return res.status(400).json({
                success: false,
                error: 'Distributor ID is required',
            });
        }
        const distributor = await database_1.default.distributor.update({
            where: { id: distributorId },
            data: { isVerified: isVerified === true },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'DISTRIBUTOR',
            entityId: distributorId ?? '',
            action: 'UPDATE',
            fieldName: 'isVerified',
            oldValue: String(!isVerified),
            newValue: String(isVerified),
            performedBy: userId,
            performedByRole: userRole,
        });
        res.json({
            success: true,
            data: distributor,
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
 * DELETE /api/distributor/:id
 * Delete distributor
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const distributorId = Array.isArray(id) ? id[0] : id;
        const distributor = await database_1.default.distributor.findUnique({
            where: { id: distributorId },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!distributor) {
            return res.status(404).json({
                success: false,
                error: 'Distributor not found',
            });
        }
        if (distributor._count.batches > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete distributor with existing batches',
            });
        }
        const normalizedId = Array.isArray(id) ? id[0] : id;
        await database_1.default.distributor.delete({
            where: { id: normalizedId },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'DISTRIBUTOR',
            entityId: distributorId ?? '',
            action: 'DELETE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { distributorData: distributor },
        });
        res.json({
            success: true,
            message: 'Distributor deleted successfully',
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
//# sourceMappingURL=distributor.routes.js.map