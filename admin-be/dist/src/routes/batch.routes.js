"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const batch_service_1 = require("../services/batch.service");
const batch_registration_service_1 = require("../services/batch-registration.service");
const audit_trail_service_1 = require("../services/audit-trail.service");
const notification_service_1 = require("../services/notification.service");
const database_1 = __importDefault(require("../config/database"));
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const router = (0, express_1.Router)();
const asString = (value) => Array.isArray(value) ? value[0] : value;
/**
 * POST /api/batch/register
 * Register a new batch on both blockchain and database
 * Requires manufacturer wallet private key in request
 */
router.post('/register', async (req, res) => {
    try {
        const { batchHash, batchNumber, manufacturingDate, expiryDate, manufacturerId, medicineId, quantity, invoiceNumber, invoiceDate, gstNumber, warehouseLocation, warehouseAddress, manufacturerWalletPrivateKey, // Base58 encoded private key
         } = req.body;
        // Validate required fields
        if (!batchHash || !batchNumber || !manufacturingDate || !expiryDate ||
            !manufacturerId || !medicineId || !quantity || !manufacturerWalletPrivateKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }
        // Reconstruct wallet from private key
        const privateKeyBytes = bs58_1.default.decode(manufacturerWalletPrivateKey);
        const manufacturerWallet = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
        // Register batch
        const result = await (0, batch_registration_service_1.registerBatch)(manufacturerWallet, {
            batchHash,
            batchNumber,
            manufacturingDate: new Date(manufacturingDate),
            expiryDate: new Date(expiryDate),
            manufacturerId,
            medicineId,
            quantity: parseInt(quantity),
            invoiceNumber,
            ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
            gstNumber,
            warehouseLocation,
            warehouseAddress,
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
            });
        }
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'MANUFACTURER';
        if (result.batchId) {
            await (0, audit_trail_service_1.createAuditTrail)({
                entityType: 'BATCH',
                entityId: result.batchId,
                action: 'CREATE',
                performedBy: userId,
                performedByRole: userRole,
                metadata: { batchNumber, batchHash },
            });
        }
        res.status(201).json({
            success: true,
            data: {
                batchId: result.batchId,
                blockchainTxHash: result.blockchainTxHash,
                blockchainPda: result.blockchainPda,
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
 * PATCH /api/batch/:batchHash/status
 * Update batch status on both blockchain and database
 */
router.patch('/:batchHash/status', async (req, res) => {
    try {
        const batchHash = asString(req.params.batchHash);
        const { newStatus, manufacturerWalletPrivateKey } = req.body;
        if (!newStatus || (newStatus !== 'VALID' && newStatus !== 'RECALLED')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be VALID or RECALLED',
            });
        }
        if (!manufacturerWalletPrivateKey) {
            return res.status(400).json({
                success: false,
                error: 'Manufacturer wallet private key is required',
            });
        }
        // Reconstruct wallet from private key
        const privateKeyBytes = bs58_1.default.decode(manufacturerWalletPrivateKey);
        const manufacturerWallet = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
        if (!batchHash) {
            return res.status(400).json({
                success: false,
                error: 'Batch hash is required',
            });
        }
        const result = await (0, batch_registration_service_1.updateBatchStatus)(manufacturerWallet, batchHash, newStatus);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error,
            });
        }
        // Get batch for audit trail and notification
        const batch = await database_1.default.batch.findUnique({
            where: { batchHash },
        });
        // Create audit trail
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'MANUFACTURER';
        if (batch) {
            await (0, audit_trail_service_1.createAuditTrail)({
                entityType: 'BATCH',
                entityId: batch.id,
                action: 'STATUS_CHANGE',
                fieldName: 'status',
                oldValue: batch.status,
                newValue: newStatus,
                performedBy: userId,
                performedByRole: userRole,
            });
            // Send notification if recalled
            if (newStatus === 'RECALLED' && batch.batchNumber) {
                await (0, notification_service_1.sendBatchRecall)(batch.id, batch.batchNumber);
            }
        }
        res.json({
            success: true,
            data: {
                blockchainTxHash: result.blockchainTxHash,
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
 * GET /api/batch/:batchHash
 * Verify batch using blockchain (internal) and return database data only
 * Frontend receives ONLY database data
 */
router.get('/:batchHash', async (req, res) => {
    try {
        const batchHash = asString(req.params.batchHash);
        if (!batchHash) {
            return res.status(400).json({
                success: false,
                error: 'Batch hash is required',
            });
        }
        const result = await (0, batch_service_1.verifyAndGetBatch)(batchHash);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
            });
        }
        // Return ONLY database data (blockchain verification is internal)
        res.json({
            success: true,
            data: result.data,
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
 * POST /api/batch/verify-qr
 * Verify QR code and return database data only
 * Blockchain verification happens internally
 */
router.post('/verify-qr', async (req, res) => {
    try {
        const { qrCode, userId, deviceId, deviceModel, deviceOS, appVersion, locationLat, locationLng, locationAddress, scanType } = req.body;
        if (!qrCode) {
            return res.status(400).json({
                success: false,
                error: 'QR code is required',
            });
        }
        const result = await (0, batch_service_1.verifyQRCode)(qrCode);
        if (!result.success || !result.data) {
            return res.status(404).json({
                success: false,
                error: result.error,
            });
        }
        // Log the scan
        await (0, batch_service_1.logScan)({
            qrCodeId: result.data.qrCode.id,
            batchId: result.data.id,
            userId,
            deviceId,
            deviceModel,
            deviceOS,
            appVersion,
            locationLat,
            locationLng,
            locationAddress,
            scanType: scanType || 'VERIFICATION',
            blockchainVerified: result.data.isVerified,
            blockchainStatus: result.data.status,
        });
        // Return ONLY database data (blockchain verification is internal)
        res.json({
            success: true,
            data: result.data,
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
//# sourceMappingURL=batch.routes.js.map