import { Router } from 'express';
import type { Request, Response } from 'express';
import { updateLifecycleStatus, markBatchAsSold } from '../services/lifecycle.service';
import { LifecycleStatus } from '@prisma/client';

const router = Router();

/**
 * PATCH /api/lifecycle/:batchId/status
 * Update batch lifecycle status
 */
router.patch('/:batchId/status', async (req: Request, res: Response) => {
  try {
    let { batchId } = req.params;
    const { status, distributorId, pharmacyId } = req.body;
    if (Array.isArray(batchId)) {
      batchId = batchId[0];
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
      });
    }

    const validStatuses: LifecycleStatus[] = [
      'IN_PRODUCTION',
      'IN_TRANSIT',
      'AT_DISTRIBUTOR',
      'AT_PHARMACY',
      'SOLD',
      'EXPIRED',
      'RECALLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID is required',
      });
    }

    const result = await updateLifecycleStatus(
      batchId,
      status,
      distributorId,
      pharmacyId,
      userId,
      userRole
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/lifecycle/:batchId/sell
 * Mark batch units as sold
 */
router.post('/:batchId/sell', async (req: Request, res: Response) => {
  try {
    let { batchId } = req.params;
    const { quantity } = req.body;

    if (Array.isArray(batchId)) {
      batchId = batchId[0];
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID is required',
      });
    }

    const result = await markBatchAsSold(batchId, parseInt(quantity), userId, userRole);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.batch,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
