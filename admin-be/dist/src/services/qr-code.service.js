"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCodes = generateQRCodes;
exports.getQRCodesForBatch = getQRCodesForBatch;
exports.deactivateQRCode = deactivateQRCode;
const database_1 = __importDefault(require("../config/database"));
const audit_trail_service_1 = require("./audit-trail.service");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a unique QR code string
 */
function generateQRCodeString(batchId, unitNumber) {
    const timestamp = Date.now();
    const randomBytes = crypto_1.default.randomBytes(8).toString('hex');
    return `QR-${batchId.substring(0, 8)}-${unitNumber}-${timestamp}-${randomBytes}`;
}
/**
 * Generate QR codes for a batch
 */
async function generateQRCodes(batchId, quantity, performedBy, performedByRole) {
    try {
        // Check if batch exists
        const batch = await database_1.default.batch.findUnique({
            where: { id: batchId },
        });
        if (!batch) {
            return {
                success: false,
                error: 'Batch not found',
            };
        }
        // Check if QR codes already exist
        const existingCount = await database_1.default.qRCode.count({
            where: { batchId },
        });
        if (existingCount > 0) {
            return {
                success: false,
                error: 'QR codes already generated for this batch',
            };
        }
        // Generate QR codes
        const qrCodes = [];
        for (let i = 1; i <= quantity; i++) {
            const code = generateQRCodeString(batchId, i);
            const qrCode = await database_1.default.qRCode.create({
                data: {
                    code,
                    batchId,
                    unitNumber: i,
                    isActive: true,
                },
            });
            qrCodes.push({
                id: qrCode.id,
                code: qrCode.code,
                unitNumber: qrCode.unitNumber,
            });
        }
        // Update batch remaining quantity
        await database_1.default.batch.update({
            where: { id: batchId },
            data: {
                remainingQuantity: quantity,
            },
        });
        await (0, audit_trail_service_1.createAuditTrail)({
            entityType: 'BATCH',
            entityId: batchId,
            action: 'CREATE',
            fieldName: 'qrCodes',
            newValue: `Generated ${quantity} QR codes`,
            performedBy,
            performedByRole,
            metadata: { quantity, qrCodeCount: qrCodes.length },
        });
        return {
            success: true,
            qrCodes,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to generate QR codes',
        };
    }
}
/**
 * Get QR codes for a batch
 */
async function getQRCodesForBatch(batchId, page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [qrCodes, total] = await Promise.all([
        database_1.default.qRCode.findMany({
            where: { batchId },
            skip,
            take: limit,
            orderBy: { unitNumber: 'asc' },
            include: {
                _count: {
                    select: { scanLogs: true },
                },
            },
        }),
        database_1.default.qRCode.count({ where: { batchId } }),
    ]);
    return {
        qrCodes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
/**
 * Deactivate a QR code
 */
async function deactivateQRCode(qrCodeId, performedBy, performedByRole) {
    const qrCode = await database_1.default.qRCode.update({
        where: { id: qrCodeId },
        data: { isActive: false },
    });
    // Create audit trail
    await (0, audit_trail_service_1.createAuditTrail)({
        entityType: 'QR_CODE',
        entityId: qrCodeId,
        action: 'UPDATE',
        fieldName: 'isActive',
        oldValue: 'true',
        newValue: 'false',
        performedBy,
        performedByRole,
    });
    return qrCode;
}
//# sourceMappingURL=qr-code.service.js.map