"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_service_1 = require("../services/inventory.service");
const router = (0, express_1.Router)();
/**
 * GET /api/inventory/summary
 * Get inventory summary
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await (0, inventory_service_1.getInventorySummary)();
        res.json({
            success: true,
            data: summary,
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
 * GET /api/inventory/low-stock
 * Get low stock batches
 */
router.get('/low-stock', async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const batches = await (0, inventory_service_1.checkLowStock)(threshold);
        res.json({
            success: true,
            data: batches,
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
 * GET /api/inventory/expiring
 * Get expiring batches
 */
router.get('/expiring', async (req, res) => {
    try {
        const daysAhead = parseInt(req.query.daysAhead) || 30;
        const batches = await (0, inventory_service_1.checkExpiringBatches)(daysAhead);
        res.json({
            success: true,
            data: batches,
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
 * GET /api/inventory/by-manufacturer
 * Get inventory grouped by manufacturer
 */
router.get('/by-manufacturer', async (req, res) => {
    try {
        const inventory = await (0, inventory_service_1.getInventoryByManufacturer)();
        res.json({
            success: true,
            data: inventory,
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
 * GET /api/inventory/by-medicine
 * Get inventory grouped by medicine
 */
router.get('/by-medicine', async (req, res) => {
    try {
        const inventory = await (0, inventory_service_1.getInventoryByMedicine)();
        res.json({
            success: true,
            data: inventory,
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
 * POST /api/inventory/mark-expired
 * Mark expired batches (admin only)
 */
router.post('/mark-expired', async (req, res) => {
    try {
        const batches = await (0, inventory_service_1.markExpiredBatches)();
        res.json({
            success: true,
            data: {
                markedCount: batches.length,
                batches,
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
//# sourceMappingURL=inventory.routes.js.map