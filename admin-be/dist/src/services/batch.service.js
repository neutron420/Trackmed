"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndGetBatch = verifyAndGetBatch;
exports.verifyQRCode = verifyQRCode;
exports.logScan = logScan;
const database_1 = __importDefault(require("../config/database"));
const blockchain_service_1 = require("./blockchain.service");
let Decimal;
try {
    const prismaRuntime = require('@prisma/client/runtime/library');
    Decimal = prismaRuntime.Decimal;
}
catch {
    // Fallback - Prisma client not generated yet
    Decimal = class {
        constructor(value) {
            return value;
        }
    };
}
/**
 * Verify batch originality using blockchain (internal) and return database data
 * Frontend receives ONLY database data, blockchain verification is internal
 */
async function verifyAndGetBatch(batchHash) {
    try {
        // Step 1: Fetch batch from database (this is what we return)
        const dbBatch = await database_1.default.batch.findUnique({
            where: { batchHash },
            include: {
                manufacturer: true,
                medicine: true,
            },
        });
        if (!dbBatch) {
            return {
                success: false,
                error: 'Batch not found in database',
            };
        }
        // Step 2: Verify on blockchain internally (not exposed to frontend)
        const blockchainVerification = await (0, blockchain_service_1.verifyBatchOnBlockchain)(batchHash, dbBatch.manufacturer.walletAddress);
        let isVerified = false;
        let verificationError;
        if (!blockchainVerification.exists || !blockchainVerification.data) {
            verificationError = blockchainVerification.error || 'Batch not verified on blockchain';
        }
        else {
            const blockchainData = blockchainVerification.data;
            const blockchainStatus = (0, blockchain_service_1.getBatchStatusString)(blockchainData.status);
            const isExpired = (0, blockchain_service_1.isBatchExpired)(blockchainData.expiryDate);
            const isValid = (0, blockchain_service_1.isBatchValid)(blockchainData.status) && !isExpired;
            // Check if database status matches blockchain
            const dbStatus = dbBatch.status === 'VALID' ? 'Valid' : 'Recalled';
            if (blockchainStatus === dbStatus && isValid) {
                isVerified = true;
            }
            else {
                verificationError = 'Blockchain status mismatch or batch is invalid';
            }
        }
        // Step 3: Return ONLY database data with verification status
        const batchData = {
            id: dbBatch.id,
            batchHash: dbBatch.batchHash,
            batchNumber: dbBatch.batchNumber,
            manufacturingDate: dbBatch.manufacturingDate,
            expiryDate: dbBatch.expiryDate,
            status: dbBatch.status,
            blockchainTxHash: dbBatch.blockchainTxHash,
            blockchainPda: dbBatch.blockchainPda,
            manufacturer: {
                id: dbBatch.manufacturer.id,
                name: dbBatch.manufacturer.name,
                licenseNumber: dbBatch.manufacturer.licenseNumber,
                address: dbBatch.manufacturer.address,
                walletAddress: dbBatch.manufacturer.walletAddress,
            },
            medicine: {
                id: dbBatch.medicine.id,
                name: dbBatch.medicine.name,
                genericName: dbBatch.medicine.genericName,
                strength: dbBatch.medicine.strength,
                composition: dbBatch.medicine.composition,
                dosageForm: dbBatch.medicine.dosageForm,
                mrp: dbBatch.medicine.mrp.toNumber(),
                imageUrl: dbBatch.medicine.imageUrl,
            },
            quantity: dbBatch.quantity,
            invoiceNumber: dbBatch.invoiceNumber,
            invoiceDate: dbBatch.invoiceDate,
            warehouseLocation: dbBatch.warehouseLocation,
            warehouseAddress: dbBatch.warehouseAddress,
            lifecycleStatus: dbBatch.lifecycleStatus,
            createdAt: dbBatch.createdAt,
            updatedAt: dbBatch.updatedAt,
            isVerified,
            ...(verificationError && { verificationError }),
        };
        return {
            success: true,
            data: batchData,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to verify and fetch batch',
        };
    }
}
/**
 * Verify QR code and return database data only
 */
async function verifyQRCode(qrCode) {
    try {
        // Find QR code in database
        const dbQRCode = await database_1.default.qRCode.findUnique({
            where: { code: qrCode },
            include: {
                batch: {
                    include: {
                        manufacturer: true,
                        medicine: true,
                    },
                },
            },
        });
        if (!dbQRCode || !dbQRCode.isActive) {
            return {
                success: false,
                error: 'QR code not found or inactive',
            };
        }
        // Verify batch using blockchain internally
        const batchVerification = await verifyAndGetBatch(dbQRCode.batch.batchHash);
        if (!batchVerification.success || !batchVerification.data) {
            return {
                success: false,
                error: batchVerification.error || 'Failed to verify batch',
            };
        }
        return {
            success: true,
            data: {
                ...batchVerification.data,
                qrCode: {
                    id: dbQRCode.id,
                    unitNumber: dbQRCode.unitNumber,
                },
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to verify QR code',
        };
    }
}
/**
 * Log a scan event
 */
async function logScan(data) {
    return database_1.default.scanLog.create({
        data: {
            qrCodeId: data.qrCodeId,
            batchId: data.batchId,
            userId: data.userId,
            deviceId: data.deviceId,
            deviceModel: data.deviceModel,
            deviceOS: data.deviceOS,
            appVersion: data.appVersion,
            locationLat: data.locationLat ? new Decimal(data.locationLat) : null,
            locationLng: data.locationLng ? new Decimal(data.locationLng) : null,
            locationAddress: data.locationAddress,
            scanType: data.scanType || 'VERIFICATION',
            blockchainVerified: data.blockchainVerified,
            blockchainStatus: data.blockchainStatus,
        },
    });
}
//# sourceMappingURL=batch.service.js.map