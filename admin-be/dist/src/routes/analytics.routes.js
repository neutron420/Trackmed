"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const router = (0, express_1.Router)();
/**
 * GET /api/analytics
 * Get analytics for a date range
 */
router.get('/', async (req, res) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : new Date();
        const metricType = req.query.metricType;
        const analytics = await (0, analytics_service_1.getAnalytics)(startDate, endDate, metricType);
        res.json({
            success: true,
            data: analytics,
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
 * POST /api/analytics/scan-statistics
 * Generate scan statistics for a date
 */
router.post('/scan-statistics', async (req, res) => {
    try {
        const date = req.body.date ? new Date(req.body.date) : new Date();
        const statistics = await (0, analytics_service_1.generateScanStatistics)(date);
        res.json({
            success: true,
            data: statistics,
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
 * GET /api/analytics/batch-statistics
 * Get batch statistics
 */
router.get('/batch-statistics', async (req, res) => {
    try {
        const statistics = await (0, analytics_service_1.generateBatchStatistics)();
        res.json({
            success: true,
            data: statistics,
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
 * GET /api/analytics/fraud-statistics
 * Get fraud statistics
 */
router.get('/fraud-statistics', async (req, res) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : new Date();
        const statistics = await (0, analytics_service_1.getFraudStatistics)(startDate, endDate);
        res.json({
            success: true,
            data: statistics,
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
//# sourceMappingURL=analytics.routes.js.map