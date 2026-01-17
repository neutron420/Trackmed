import { Router } from 'express';
import type { Request, Response } from 'express';
import { generateQRCodes, getQRCodesForBatch, deactivateQRCode } from '../services/qr-code.service';

const router = Router();

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
