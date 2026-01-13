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
 * GET /api/manufacturer
 * Get all manufacturers with pagination
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
        const [manufacturers, total] = await Promise.all([
            database_1.default.manufacturer.findMany({
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
            database_1.default.manufacturer.count({ where }),
        ]);
        res.json({
            success: true,
            data: manufacturers,
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
 * GET /api/manufacturer/:id
 * Get manufacturer by ID
 */
router.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const manufacturer = await database_1.default.manufacturer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!manufacturer) {
            return res.status(404).json({
                success: false,
                error: 'Manufacturer not found',
            });
        }
        res.json({
            success: true,
            data: manufacturer,
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
 * POST /api/manufacturer
 * Create a new manufacturer
 */
router.post('/', async (req, res) => {
    try {
        const { name, licenseNumber, address, city, state, country, phone, email, gstNumber, walletAddress, } = req.body;
        if (!name || !licenseNumber || !address || !walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Name, license number, address, and wallet address are required',
            });
        }
        // Check if license number already exists
        const existing = await database_1.default.manufacturer.findUnique({
            where: { licenseNumber },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Manufacturer with this license number already exists',
            });
        }
        const manufacturer = await database_1.default.manufacturer.create({
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
                walletAddress,
                isVerified: false,
            },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MANUFACTURER',
            entityId: manufacturer.id,
            action: 'CREATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { manufacturerData: manufacturer },
        });
        res.status(201).json({
            success: true,
            data: manufacturer,
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
 * PATCH /api/manufacturer/:id
 * Update manufacturer
 */
router.patch('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const updateData = req.body;
        const existing = await database_1.default.manufacturer.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Manufacturer not found',
            });
        }
        // Don't allow updating license number or wallet address
        delete updateData.licenseNumber;
        delete updateData.walletAddress;
        const manufacturer = await database_1.default.manufacturer.update({
            where: { id },
            data: updateData,
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MANUFACTURER',
            entityId: id,
            action: 'UPDATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { updateData, previousData: existing },
        });
        res.json({
            success: true,
            data: manufacturer,
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
 * PATCH /api/manufacturer/:id/verify
 * Verify/unverify manufacturer
 */
router.patch('/:id/verify', async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const { isVerified } = req.body;
        const manufacturer = await database_1.default.manufacturer.update({
            where: { id },
            data: { isVerified: isVerified === true },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MANUFACTURER',
            entityId: id,
            action: 'UPDATE',
            fieldName: 'isVerified',
            oldValue: String(!isVerified),
            newValue: String(isVerified),
            performedBy: userId,
            performedByRole: userRole,
        });
        res.json({
            success: true,
            data: manufacturer,
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
 * DELETE /api/manufacturer/:id
 * Delete manufacturer (soft delete by setting isVerified to false)
 */
router.delete('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        if (Array.isArray(id)) {
            id = id[0];
        }
        const manufacturer = await database_1.default.manufacturer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!manufacturer) {
            return res.status(404).json({
                success: false,
                error: 'Manufacturer not found',
            });
        }
        if (manufacturer._count.batches > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete manufacturer with existing batches',
            });
        }
        await database_1.default.manufacturer.delete({
            where: { id },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MANUFACTURER',
            entityId: id,
            action: 'DELETE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { manufacturerData: manufacturer },
        });
        res.json({
            success: true,
            message: 'Manufacturer deleted successfully',
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
//# sourceMappingURL=manufacturer.routes.js.map