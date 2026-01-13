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
 * GET /api/medicine
 * Get all medicines with pagination
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
                { genericName: { contains: search, mode: 'insensitive' } },
                { composition: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [medicines, total] = await Promise.all([
            database_1.default.medicine.findMany({
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
            database_1.default.medicine.count({ where }),
        ]);
        res.json({
            success: true,
            data: medicines,
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
 * GET /api/medicine/:id
 * Get medicine by ID
 */
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (Array.isArray(id)) {
            id = id[0];
        }
        id = typeof id === 'string' ? id : String(id);
        const medicine = await database_1.default.medicine.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!medicine) {
            return res.status(404).json({
                success: false,
                error: 'Medicine not found',
            });
        }
        res.json({
            success: true,
            data: medicine,
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
 * POST /api/medicine
 * Create a new medicine
 */
router.post('/', async (req, res) => {
    try {
        const { name, genericName, strength, composition, dosageForm, mrp, storageCondition, imageUrl, description, } = req.body;
        if (!name || !strength || !composition || !dosageForm || mrp === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Name, strength, composition, dosage form, and MRP are required',
            });
        }
        const medicine = await database_1.default.medicine.create({
            data: {
                name,
                genericName,
                strength,
                composition,
                dosageForm,
                mrp: parseFloat(mrp),
                storageCondition,
                imageUrl,
                description,
            },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MEDICINE',
            entityId: medicine.id,
            action: 'CREATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { medicineData: medicine },
        });
        res.status(201).json({
            success: true,
            data: medicine,
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
 * PATCH /api/medicine/:id
 * Update medicine
 */
router.patch('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        const updateData = req.body;
        if (Array.isArray(id)) {
            id = id[0];
        }
        id = typeof id === 'string' ? id : String(id);
        const existing = await database_1.default.medicine.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Medicine not found',
            });
        }
        // Convert mrp to number if provided
        if (updateData.mrp !== undefined) {
            updateData.mrp = parseFloat(updateData.mrp);
        }
        const medicine = await database_1.default.medicine.update({
            where: { id },
            data: updateData,
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MEDICINE',
            entityId: id,
            action: 'UPDATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { updateData, previousData: existing },
        });
        res.json({
            success: true,
            data: medicine,
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
 * DELETE /api/medicine/:id
 * Delete medicine
 */
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        if (Array.isArray(id)) {
            id = id[0];
        }
        id = typeof id === 'string' ? id : String(id);
        const normalizedId = id;
        const medicine = await database_1.default.medicine.findUnique({
            where: { id: normalizedId },
            include: {
                _count: {
                    select: { batches: true },
                },
            },
        });
        if (!medicine) {
            return res.status(404).json({
                success: false,
                error: 'Medicine not found',
            });
        }
        if (medicine._count.batches > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete medicine with existing batches',
            });
        }
        await database_1.default.medicine.delete({
            where: { id: normalizedId },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'MEDICINE',
            entityId: normalizedId,
            action: 'DELETE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { medicineData: medicine },
        });
        res.json({
            success: true,
            message: 'Medicine deleted successfully',
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
//# sourceMappingURL=medicine.routes.js.map