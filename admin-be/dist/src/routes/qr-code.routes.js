"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qr_code_service_1 = require("../services/qr-code.service");
const router = (0, express_1.Router)();
/**
 * POST /api/qr-code/generate
 * Generate QR codes for a batch
 */
router.post('/generate', async (req, res) => {
    try {
        const { batchId, quantity } = req.body;
        if (!batchId || !quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Batch ID and valid quantity are required',
            });
        }
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        const result = await (0, qr_code_service_1.generateQRCodes)(batchId, parseInt(quantity), userId, userRole);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
            });
        }
        res.status(201).json({
            success: true,
            data: {
                qrCodes: result.qrCodes,
                count: result.qrCodes?.length || 0,
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
 * GET /api/qr-code/batch/:batchId
 * Get QR codes for a batch
 */
router.get('/batch/:batchId', async (req, res) => {
    try {
        let { batchId } = req.params;
        if (Array.isArray(batchId)) {
            batchId = batchId[0];
        }
        batchId = typeof batchId === 'string' ? batchId : String(batchId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        if (!batchId) {
            return res.status(400).json({
                success: false,
                error: 'Batch ID is required',
            });
        }
        const result = await (0, qr_code_service_1.getQRCodesForBatch)(batchId, page, limit);
        res.json({
            success: true,
            data: result.qrCodes,
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
 * PATCH /api/qr-code/:id/deactivate
 * Deactivate a QR code
 */
router.patch('/:id/deactivate', async (req, res) => {
    try {
        let { id } = req.params;
        if (Array.isArray(id)) {
            id = id[0];
        }
        id = typeof id === 'string' ? id : String(id);
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'QR Code ID is required',
            });
        }
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'ADMIN';
        const qrCode = await (0, qr_code_service_1.deactivateQRCode)(id, userId, userRole);
        res.json({
            success: true,
            data: qrCode,
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
//# sourceMappingURL=qr-code.routes.js.map