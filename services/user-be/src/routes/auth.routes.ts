import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
} from '../services/auth.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new consumer user
 */
router.post(
  '/register',
  validate([
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Invalid phone number'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, phone } = req.body;

      const result = await registerUser({ email, password, name, phone });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  validate([
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('deviceId')
      .optional()
      .isString(),
    body('deviceName')
      .optional()
      .isString(),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { email, password, deviceId, deviceName } = req.body;

      const result = await loginUser({ email, password, deviceId, deviceName });

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate([
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const result = await refreshAccessToken(refreshToken);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Token refresh failed',
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout - revoke refresh token
 */
router.post(
  '/logout',
  validate([
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const result = await logoutUser(refreshToken);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Logout failed',
      });
    }
  }
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post(
  '/logout-all',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const result = await logoutAllDevices(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Logged out from all devices',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Logout failed',
      });
    }
  }
);

export default router;
