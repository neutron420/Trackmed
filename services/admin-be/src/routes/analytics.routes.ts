import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getAnalytics,
  generateScanStatistics,
  generateBatchStatistics,
  getFraudStatistics,
  getDashboardAnalytics,
} from '../services/analytics.service';

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const result = await getDashboardAnalytics(days);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/analytics
 * Get analytics for a date range
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();
    const metricType = req.query.metricType as string | undefined;

    const analytics = await getAnalytics(startDate, endDate, metricType);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/analytics/scan-statistics
 * Generate scan statistics for a date
 */
router.post('/scan-statistics', async (req: Request, res: Response) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();

    const statistics = await generateScanStatistics(date);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/analytics/batch-statistics
 * Get batch statistics
 */
router.get('/batch-statistics', async (req: Request, res: Response) => {
  try {
    const statistics = await generateBatchStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/analytics/fraud-statistics
 * Get fraud statistics
 */
router.get('/fraud-statistics', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const statistics = await getFraudStatistics(startDate, endDate);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
