import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import {
  scanQRCode,
  getMedicineById,
  getBatchById,
  searchMedicines,
  getScanHistory,
} from '../services/scan.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/scan
 * Scan QR code and get medicine details
 * Auth is optional - anonymous scans allowed
 */
router.post(
  '/',
  optionalAuth,
  validate([
    body('qrCode')
      .trim()
      .notEmpty()
      .withMessage('QR code is required'),
    body('deviceId')
      .optional()
      .isString(),
    body('deviceModel')
      .optional()
      .isString(),
    body('deviceOS')
      .optional()
      .isString(),
    body('appVersion')
      .optional()
      .isString(),
    body('locationLat')
      .optional()
      .isFloat({ min: -90, max: 90 }),
    body('locationLng')
      .optional()
      .isFloat({ min: -180, max: 180 }),
    body('locationAddress')
      .optional()
      .isString(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { qrCode, ...deviceInfo } = req.body;
      const userId = req.user?.userId;

      const result = await scanQRCode(qrCode, userId, deviceInfo);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to scan QR code',
      });
    }
  }
);

/**
 * GET /api/scan/history
 * Get user's scan history
 */
router.get(
  '/history',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await getScanHistory(userId, page, limit);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data.scans,
        pagination: result.data.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get scan history',
      });
    }
  }
);

/**
 * GET /api/scan/medicine/:id
 * Get medicine details by ID
 */
router.get(
  '/medicine/:id',
  validate([param('id').notEmpty().withMessage('Medicine ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const result = await getMedicineById(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get medicine',
      });
    }
  }
);

/**
 * GET /api/scan/batch/:id
 * Get batch details by ID
 */
router.get(
  '/batch/:id',
  validate([param('id').notEmpty().withMessage('Batch ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const result = await getBatchById(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get batch',
      });
    }
  }
);

/**
 * GET /api/scan/search
 * Search medicines by name
 */
router.get(
  '/search',
  validate([
    query('q')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const q = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await searchMedicines(q, page, limit);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data.medicines,
        pagination: result.data.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search medicines',
      });
    }
  }
);

export default router;
