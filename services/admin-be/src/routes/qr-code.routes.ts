import { Router } from 'express';
import type { Request, Response } from 'express';
import { generateQRCodes, getQRCodesForBatch, deactivateQRCode } from '../services/qr-code.service';
import prisma from '../config/database';

const router = Router();

router.get('/verify/:code', async (req: Request, res: Response) => {
  try {
    let { code } = req.params;
    if (Array.isArray(code)) {
      code = code[0];
    }
    code = typeof code === 'string' ? code : String(code);

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'QR Code is required',
      });
    }

    // Find QR code with related data
    const qrCode = await prisma.qRCode.findFirst({
      where: { code },
      include: {
        batch: {
          include: {
            medicine: true,
            manufacturer: true,
          },
        },
      },
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: 'Invalid QR Code - This product could not be verified',
      });
    }

    // Log the scan
    await prisma.scanLog.create({
      data: {
        qrCodeId: qrCode.id,
        batchId: qrCode.batchId,
        scanType: 'VERIFICATION',
        locationAddress: req.headers['x-forwarded-for'] as string || req.ip || 'Unknown',
      },
    });

    // Get scan count
    const scanCount = await prisma.scanLog.count({
      where: { qrCodeId: qrCode.id },
    });

    const batch = qrCode.batch;
    const medicine = batch.medicine;
    const manufacturer = batch.manufacturer;

    // Check verification status
    const isExpired = new Date(batch.expiryDate) < new Date();
    const isRecalled = batch.status === 'RECALLED';
    const isActive = qrCode.isActive;

    let verificationMessage = 'This product is authentic and verified';
    let isVerified = true;

    if (!isActive) {
      verificationMessage = 'This QR code has been deactivated';
      isVerified = false;
    } else if (isRecalled) {
      verificationMessage = 'WARNING: This product has been recalled';
      isVerified = false;
    } else if (isExpired) {
      verificationMessage = 'This medicine has expired';
      isVerified = true; // Still verified, just expired
    }

    res.json({
      success: true,
      data: {
        batch: {
          id: batch.id,
          batchNumber: batch.batchNumber,
          manufacturingDate: batch.manufacturingDate,
          expiryDate: batch.expiryDate,
          quantity: batch.quantity,
          status: batch.status,
          lifecycleStatus: batch.lifecycleStatus,
          warehouseLocation: batch.warehouseLocation,
          imageUrl: batch.imageUrl,
          gstNumber: batch.gstNumber,
        },
        medicine: {
          name: medicine.name,
          strength: medicine.strength,
          dosageForm: medicine.dosageForm,
          description: medicine.description,
          imageUrl: medicine.imageUrl,
        },
        manufacturer: {
          name: manufacturer.name,
          licenseNumber: manufacturer.licenseNumber,
          address: manufacturer.address,
        },
        qrCode: {
          code: qrCode.code,
          isActive: qrCode.isActive,
          scannedCount: scanCount,
          createdAt: qrCode.createdAt,
        },
        isVerified,
        verificationMessage,
      },
    });
  } catch (error: any) {
    console.error('QR Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification service temporarily unavailable',
    });
  }
});

/**
 * GET /api/qr-code
 * Get all QR codes with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          batch: {
            select: {
              batchNumber: true,
              medicine: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.qRCode.count(),
    ]);

    // Get total scans
    const totalScans = await prisma.scanLog.count();

    res.json({
      success: true,
      data: qrCodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalQRCodes: total,
        totalScans,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/qr-code/generate
 * Generate QR codes for a batch
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { batchId, quantity } = req.body;

    if (!batchId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID and valid quantity are required',
      });
    }

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';

    const result = await generateQRCodes(batchId, parseInt(quantity), userId, userRole);

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
  } catch (error: any) {
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
router.get('/batch/:batchId', async (req: Request, res: Response) => {
  try {
    let { batchId } = req.params;
    if (Array.isArray(batchId)) {
      batchId = batchId[0];
    }
    batchId = typeof batchId === 'string' ? batchId : String(batchId);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID is required',
      });
    }

    const result = await getQRCodesForBatch(batchId, page, limit);

    res.json({
      success: true,
      data: result.qrCodes,
      pagination: result.pagination,
    });
  } catch (error: any) {
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
router.patch('/:id/deactivate', async (req: Request, res: Response) => {
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

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';

    const qrCode = await deactivateQRCode(id, userId, userRole);

    res.json({
      success: true,
      data: qrCode,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
