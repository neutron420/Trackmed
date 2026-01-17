import { Router, Response } from 'express';
import { body, param } from 'express-validator';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../services/profile.service';
import { changePassword } from '../services/auth.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await getProfile(userId);

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
      error: error.message || 'Failed to get profile',
    });
  }
});

/**
 * PUT /api/profile
 * Update current user's profile
 */
router.put(
  '/',
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Invalid phone number'),
    body('avatarUrl')
      .optional()
      .isURL()
      .withMessage('Invalid avatar URL'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { name, phone, avatarUrl } = req.body;

      const result = await updateProfile(userId, { name, phone, avatarUrl });

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
        error: error.message || 'Failed to update profile',
      });
    }
  }
);

/**
 * PUT /api/profile/password
 * Change password
 */
router.put(
  '/password',
  validate([
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      const result = await changePassword(userId, currentPassword, newPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to change password',
      });
    }
  }
);

/**
 * DELETE /api/profile
 * Delete (deactivate) account
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await deleteAccount(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete account',
    });
  }
});

// ==================== ADDRESS ROUTES ====================

/**
 * GET /api/profile/addresses
 * Get all addresses
 */
router.get('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await getAddresses(userId);

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
      error: error.message || 'Failed to get addresses',
    });
  }
});

/**
 * POST /api/profile/addresses
 * Add new address
 */
router.post(
  '/addresses',
  validate([
    body('label')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Label must be max 50 characters'),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name is required (2-100 chars)'),
    body('phone')
      .isMobilePhone('en-IN')
      .withMessage('Valid phone number is required'),
    body('addressLine1')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Address line 1 is required (5-200 chars)'),
    body('addressLine2')
      .optional()
      .trim()
      .isLength({ max: 200 }),
    body('city')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('City is required'),
    body('state')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('State is required'),
    body('pincode')
      .matches(/^[1-9][0-9]{5}$/)
      .withMessage('Valid 6-digit pincode is required'),
    body('landmark')
      .optional()
      .trim()
      .isLength({ max: 200 }),
    body('isDefault')
      .optional()
      .isBoolean(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await addAddress(userId, req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.status(201).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to add address',
      });
    }
  }
);

/**
 * PUT /api/profile/addresses/:id
 * Update address
 */
router.put(
  '/addresses/:id',
  validate([
    param('id').notEmpty().withMessage('Address ID is required'),
    body('label')
      .optional()
      .trim()
      .isLength({ max: 50 }),
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }),
    body('phone')
      .optional()
      .isMobilePhone('en-IN'),
    body('addressLine1')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 }),
    body('addressLine2')
      .optional()
      .trim()
      .isLength({ max: 200 }),
    body('city')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }),
    body('state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }),
    body('pincode')
      .optional()
      .matches(/^[1-9][0-9]{5}$/),
    body('isDefault')
      .optional()
      .isBoolean(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await updateAddress(userId, id, req.body);

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
        error: error.message || 'Failed to update address',
      });
    }
  }
);

/**
 * DELETE /api/profile/addresses/:id
 * Delete address
 */
router.delete(
  '/addresses/:id',
  validate([param('id').notEmpty().withMessage('Address ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await deleteAddress(userId, id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete address',
      });
    }
  }
);

/**
 * PATCH /api/profile/addresses/:id/default
 * Set address as default
 */
router.patch(
  '/addresses/:id/default',
  validate([param('id').notEmpty().withMessage('Address ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await setDefaultAddress(userId, id);

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
        error: error.message || 'Failed to set default address',
      });
    }
  }
);

export default router;
