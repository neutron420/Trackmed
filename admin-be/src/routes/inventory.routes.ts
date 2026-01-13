import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  checkLowStock,
  checkExpiringBatches,
  getInventorySummary,
  getInventoryByManufacturer,
  getInventoryByMedicine,
  markExpiredBatches,
} from '../services/inventory.service';

const router = Router();

/**
 * GET /api/inventory/summary
 * Get inventory summary
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await getInventorySummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/inventory/low-stock
 * Get low stock batches
 */
router.get('/low-stock', async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    const batches = await checkLowStock(threshold);

    res.json({
      success: true,
      data: batches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/inventory/expiring
 * Get expiring batches
 */
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    const daysAhead = parseInt(req.query.daysAhead as string) || 30;
    const batches = await checkExpiringBatches(daysAhead);

    res.json({
      success: true,
      data: batches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/inventory/by-manufacturer
 * Get inventory grouped by manufacturer
 */
router.get('/by-manufacturer', async (req: Request, res: Response) => {
  try {
    const inventory = await getInventoryByManufacturer();

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/inventory/by-medicine
 * Get inventory grouped by medicine
 */
router.get('/by-medicine', async (req: Request, res: Response) => {
  try {
    const inventory = await getInventoryByMedicine();

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/inventory/mark-expired
 * Mark expired batches (admin only)
 */
router.post('/mark-expired', async (req: Request, res: Response) => {
  try {
    const batches = await markExpiredBatches();

    res.json({
      success: true,
      data: {
        markedCount: batches.length,
        batches,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
