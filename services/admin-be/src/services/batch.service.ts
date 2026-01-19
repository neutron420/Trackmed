import prisma from '../config/database';
import {
  verifyBatchOnBlockchain,
  isBatchValid,
  isBatchExpired,
  getBatchStatusString,
} from './blockchain.service';
// Prisma Decimal type - will be available after Prisma client generation
// For now, use a workaround
type DecimalConstructor = new (value: number | string) => any;
let Decimal: DecimalConstructor;
try {
  const prismaRuntime = require('@prisma/client/runtime/library');
  Decimal = prismaRuntime.Decimal;
} catch {
  // Fallback - Prisma client not generated yet
  Decimal = class {
    constructor(value: number | string) {
      return value;
    }
  } as DecimalConstructor;
}

/**
 * Batch data returned to frontend - ONLY from database
 * Blockchain verification happens internally and is not exposed
 */
export interface BatchData {
  // All data comes from database
  id: string;
  batchHash: string;
  batchNumber: string;
  manufacturingDate: Date;
  expiryDate: Date;
  status: 'VALID' | 'RECALLED';
  blockchainTxHash: string | null;
  blockchainPda: string | null;
  // Optional batch image (e.g., packaging photo) stored in DB (Cloudflare R2 URL)
  imageUrl: string | null;
  
  // Business details
  manufacturer: {
    id: string;
    name: string;
    licenseNumber: string;
    address: string;
    walletAddress: string;
  };
  medicine: {
    id: string;
    name: string;
    genericName: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: number;
    imageUrl: string | null;
  };
  quantity: number;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  warehouseLocation: string | null;
  warehouseAddress: string | null;
  lifecycleStatus: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Verification status (internal blockchain check result)
  isVerified: boolean;
  verificationError?: string;
}

/**
 * Verify batch originality using blockchain (internal) and return database data
 * Frontend receives ONLY database data, blockchain verification is internal
 */
export async function verifyAndGetBatch(
  batchHash: string
): Promise<{
  success: boolean;
  data?: BatchData;
  error?: string;
}> {
  try {
    // Step 1: Fetch batch from database (this is what we return)
    const dbBatch = await prisma.batch.findUnique({
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
    const blockchainVerification = await verifyBatchOnBlockchain(
      batchHash,
      dbBatch.manufacturer.walletAddress
    );

    let isVerified = false;
    let verificationError: string | undefined;

    if (!blockchainVerification.exists || !blockchainVerification.data) {
      verificationError = blockchainVerification.error || 'Batch not verified on blockchain';
    } else {
      const blockchainData = blockchainVerification.data;
      const blockchainStatus = getBatchStatusString(blockchainData.status);
      const isExpired = isBatchExpired(blockchainData.expiryDate);
      const isValid = isBatchValid(blockchainData.status) && !isExpired;
      
      // Check if database status matches blockchain
      const dbStatus = dbBatch.status === 'VALID' ? 'Valid' : 'Recalled';
      if (blockchainStatus === dbStatus && isValid) {
        isVerified = true;
      } else {
        verificationError = 'Blockchain status mismatch or batch is invalid';
      }
    }

    // Step 3: Return ONLY database data with verification status
    const batchData: BatchData = {
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
      imageUrl: dbBatch.imageUrl,
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify and fetch batch',
    };
  }
}

/**
 * Verify QR code and return database data only
 */
export async function verifyQRCode(
  qrCode: string
): Promise<{
  success: boolean;
  data?: BatchData & { qrCode: { id: string; unitNumber: number | null } };
  error?: string;
}> {
  try {
    // Find QR code in database
    const dbQRCode = await prisma.qRCode.findUnique({
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to verify QR code',
    };
  }
}

/**
 * Log a scan event
 */
export async function logScan(data: {
  qrCodeId: string;
  batchId: string;
  userId?: string;
  deviceId?: string;
  deviceModel?: string;
  deviceOS?: string;
  appVersion?: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  scanType?: 'VERIFICATION' | 'PURCHASE' | 'DISTRIBUTION' | 'RECALL_CHECK';
  blockchainVerified: boolean;
  blockchainStatus?: string;
}) {
  return prisma.scanLog.create({
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
