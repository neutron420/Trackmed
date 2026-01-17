import { Router, Response } from 'express';
import { body, param, query } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  initiatePayment,
  verifyPayment,
  trackOrder,
} from '../services/order.service';
import { validate } from '../middleware/validation.middleware';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * POST /api/orders
 * Create order from cart
 */
router.post(
  '/',
  validate([
    body('addressId')
      .notEmpty()
      .withMessage('Address ID is required'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes must be max 500 characters'),
    body('prescriptionUrl')
      .optional()
      .isURL()
      .withMessage('Invalid prescription URL'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { addressId, notes, prescriptionUrl } = req.body;

      const result = await createOrder(userId, { addressId, notes, prescriptionUrl });

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
        error: error.message || 'Failed to create order',
      });
    }
  }
);

/**
 * GET /api/orders
 * Get user's orders
 */
router.get(
  '/',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;

      const result = await getOrders(userId, page, limit, status);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: result.data.orders,
        pagination: result.data.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get orders',
      });
    }
  }
);

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get(
  '/:id',
  validate([param('id').notEmpty().withMessage('Order ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;

      const result = await getOrderById(userId, id);

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
        error: error.message || 'Failed to get order',
      });
    }
  }
);

/**
 * GET /api/orders/:id/track
 * Track order
 */
router.get(
  '/:id/track',
  validate([param('id').notEmpty().withMessage('Order ID is required')]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;

      const result = await trackOrder(userId, id);

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
        error: error.message || 'Failed to track order',
      });
    }
  }
);

/**
 * PATCH /api/orders/:id/cancel
 * Cancel order
 */
router.patch(
  '/:id/cancel',
  validate([
    param('id').notEmpty().withMessage('Order ID is required'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must be max 500 characters'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const { reason } = req.body;

      const result = await cancelOrder(userId, id, reason);

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
        error: error.message || 'Failed to cancel order',
      });
    }
  }
);

/**
 * POST /api/orders/:id/payment
 * Initiate payment for order
 */
router.post(
  '/:id/payment',
  validate([
    param('id').notEmpty().withMessage('Order ID is required'),
    body('paymentMethod')
      .notEmpty()
      .isIn(['UPI', 'CARD', 'NETBANKING', 'WALLET', 'COD'])
      .withMessage('Invalid payment method'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const { paymentMethod } = req.body;

      const result = await initiatePayment(userId, id, paymentMethod);

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
        error: error.message || 'Failed to initiate payment',
      });
    }
  }
);

/**
 * POST /api/orders/payment/verify
 * Verify payment callback
 */
router.post(
  '/payment/verify',
  validate([
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required'),
    body('paymentId')
      .notEmpty()
      .withMessage('Payment ID is required'),
    body('signature')
      .notEmpty()
      .withMessage('Signature is required'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { orderId, paymentId, signature } = req.body;

      const result = await verifyPayment(orderId, paymentId, signature);

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
        error: error.message || 'Failed to verify payment',
      });
    }
  }
);

export default router;
