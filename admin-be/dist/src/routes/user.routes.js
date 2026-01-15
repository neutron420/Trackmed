"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../config/database"));
const audit_trail_service_1 = require("../services/audit-trail.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const role = req.query.role;
        const search = req.query.search;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_1.default.user.count({ where }),
        ]);
        res.json({
            success: true,
            data: users,
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
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Array.isArray(id) ? id[0] : id;
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and role are required',
            });
        }
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists',
            });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                name,
                role,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'USER',
            entityId: user.id,
            action: 'CREATE',
            performedBy: userId,
            performedByRole: userRole,
            metadata: { userEmail: user.email, userRole: user.role },
        });
        res.status(201).json({
            success: true,
            data: user,
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
 * PATCH /api/user/:id
 * Update user
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, isActive, password } = req.body;
        const targetUserId = Array.isArray(id) ? id[0] : id;
        const existing = await database_1.default.user.findUnique({
            where: { id: targetUserId },
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (role !== undefined)
            updateData.role = role;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        if (password) {
            updateData.passwordHash = await bcrypt_1.default.hash(password, 10);
        }
        const user = await database_1.default.user.update({
            where: { id: targetUserId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Create audit trail
        const performedByUserId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'USER',
            entityId: targetUserId,
            action: 'UPDATE',
            performedBy: performedByUserId,
            performedByRole: userRole,
            metadata: { updateData, previousData: existing },
        });
        res.json({
            success: true,
            data: user,
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
 * DELETE /api/user/:id
 * Delete user (soft delete by deactivating)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const targetUserId = Array.isArray(id) ? id[0] : id;
        const user = await database_1.default.user.findUnique({
            where: { id: targetUserId },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }
        // Soft delete by deactivating
        await database_1.default.user.update({
            where: { id: targetUserId },
            data: { isActive: false },
        });
        // Create audit trail
        const performedByUserId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'USER',
            entityId: targetUserId,
            action: 'DELETE',
            performedBy: performedByUserId,
            performedByRole: userRole,
            metadata: { userEmail: user.email },
        });
        res.json({
            success: true,
            message: 'User deactivated successfully',
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
//# sourceMappingURL=user.routes.js.map