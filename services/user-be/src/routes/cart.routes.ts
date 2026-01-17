import { Router, Response } from 'express';
import { body, param } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from '../services/cart.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Get cart with all items
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await getCart(userId);

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
      error: error.message || 'Failed to get cart',
    });
  }
});

/**
 * GET /api/cart/count
 * Get cart item count
 */
router.get('/count', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await getCartCount(userId);

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
      error: error.message || 'Failed to get cart count',
    });
  }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post(
  '/items',
  validate([
    body('batchId')
      .notEmpty()
      .withMessage('Batch ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { batchId, quantity = 1 } = req.body;

      const result = await addToCart(userId, batchId, quantity);

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
        error: error.message || 'Failed to add to cart',
      });
    }
  }
);

/**
 * PUT /api/cart/items/:batchId
 * Update cart item quantity
 */
router.put(
  '/items/:batchId',
  validate([
    param('batchId').notEmpty().withMessage('Batch ID is required'),
    body('quantity')
      .isInt({ min: 0, max: 100 })
      .withMessage('Quantity must be between 0 and 100'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const batchId = req.params.batchId as string;
      const { quantity } = req.body;

      const result = await updateCartItem(userId, batchId, quantity);

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
        error: error.message || 'Failed to update cart',
      });
    }
  }
);

/**
 * DELETE /api/cart/items/:batchId
 * Remove item from cart
 */
router.delete(
  '/items/:batchId',
  validate([param('batchId').notEmpty().withMessage('Batch ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const batchId = req.params.batchId as string;

      const result = await removeFromCart(userId, batchId);

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
        error: error.message || 'Failed to remove from cart',
      });
    }
  }
);

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await clearCart(userId);

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
      error: error.message || 'Failed to clear cart',
    });
  }
});

export default router;
