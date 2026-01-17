import prisma from '../config/database';
import { createAuditTrail } from './audit-trail.service';
import crypto from 'crypto';

/**
 * Generate a unique QR code string
 */
function generateQRCodeString(batchId: string, unitNumber: number): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `QR-${batchId.substring(0, 8)}-${unitNumber}-${timestamp}-${randomBytes}`;
}

/**
 * Generate QR codes for a batch
 */
export async function generateQRCodes(
  batchId: string,
  quantity: number,
  performedBy: string,
  performedByRole?: string
): Promise<{
  success: boolean;
  qrCodes?: Array<{ id: string; code: string; unitNumber: number | null }>;
  error?: string;
}> {
  try {
    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    // Check if QR codes already exist
    const existingCount = await prisma.qRCode.count({
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
      const qrCode = await prisma.qRCode.create({
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
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        remainingQuantity: quantity,
      },
    });
    await createAuditTrail({
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate QR codes',
    };
  }
}

/**
 * Get QR codes for a batch
 */
export async function getQRCodesForBatch(
  batchId: string,
  page: number = 1,
  limit: number = 100
) {
  const skip = (page - 1) * limit;

  const [qrCodes, total] = await Promise.all([
    prisma.qRCode.findMany({
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
    prisma.qRCode.count({ where: { batchId } }),
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
export async function deactivateQRCode(
  qrCodeId: string,
  performedBy: string,
  performedByRole?: string
) {
  const qrCode = await prisma.qRCode.update({
    where: { id: qrCodeId },
    data: { isActive: false },
  });

  // Create audit trail
  await createAuditTrail({
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
