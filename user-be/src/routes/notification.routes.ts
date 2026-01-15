import { Router, Response } from 'express';
import { body } from 'express-validator';
import {
  registerPushToken,
  unregisterPushToken,
  getUserPushTokens,
} from '../services/push-notification.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * POST /api/notifications/token
 * Register push notification token (OneSignal player ID)
 */
router.post(
  '/token',
  validate([
    body('playerId')
      .notEmpty()
      .withMessage('Player ID is required')
      .isString()
      .withMessage('Player ID must be a string'),
    body('deviceType')
      .optional()
      .isIn(['android', 'ios'])
      .withMessage('Device type must be android or ios'),
    body('deviceModel')
      .optional()
      .isString()
      .isLength({ max: 100 }),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { playerId, deviceType, deviceModel } = req.body;

      const result = await registerPushToken(userId, playerId, deviceType, deviceModel);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Push token registered successfully',
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to register push token',
      });
    }
  }
);

/**
 * DELETE /api/notifications/token
 * Unregister push notification token
 */
router.delete(
  '/token',
  validate([
    body('playerId')
      .notEmpty()
      .withMessage('Player ID is required'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { playerId } = req.body;

      const result = await unregisterPushToken(userId, playerId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Push token unregistered successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unregister push token',
      });
    }
  }
);

/**
 * GET /api/notifications/tokens
 * Get all registered push tokens for current user
 */
router.get('/tokens', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await getUserPushTokens(userId);

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
      error: error.message || 'Failed to get push tokens',
    });
  }
});

export default router;
