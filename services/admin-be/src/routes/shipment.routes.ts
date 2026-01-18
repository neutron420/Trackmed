import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  cancelShipment,
  getShipmentStats,
  ShipmentStatus,
} from '../services/shipment.service';

const router = Router();

/**
 * GET /api/shipment/stats
 * Get shipment statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await getShipmentStats();

    if (!result.success) {
      return res.status(500).json({
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
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/shipment
 * Get all shipments with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      distributorId,
      batchId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;

    const result = await getShipments({
      status: status as ShipmentStatus | undefined,
      distributorId: distributorId as string | undefined,
      batchId: batchId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
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
 * GET /api/shipment/:id
 * Get shipment by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const result = await getShipmentById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.shipment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/shipment
 * Create a new shipment
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      batchId,
      distributorId,
      quantity,
      pickupAddress,
      deliveryAddress,
      trackingNumber,
      carrier,
      estimatedDelivery,
      notes,
    } = req.body;

    if (!batchId || !distributorId || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'batchId, distributorId, and quantity are required',
      });
    }

    const userId = (req as any).user?.userId || 'system';

    const result = await createShipment({
      batchId,
      distributorId,
      quantity: parseInt(quantity),
      pickupAddress,
      deliveryAddress,
      trackingNumber,
      carrier,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      notes,
      createdBy: userId,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.status(201).json({
      success: true,
      data: result.shipment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/shipment/:id/status
 * Update shipment status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, location, description } = req.body;

    const validStatuses: ShipmentStatus[] = [
      'PENDING',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const userId = (req as any).user?.userId || 'system';

    const result = await updateShipmentStatus(id, status, {
      location,
      description,
      updatedBy: userId,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.shipment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/shipment/:id/cancel
 * Cancel a shipment
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation reason is required',
      });
    }

    const userId = (req as any).user?.userId || 'system';

    const result = await cancelShipment(id, reason, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.shipment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
