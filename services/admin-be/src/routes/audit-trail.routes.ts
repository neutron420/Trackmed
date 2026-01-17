import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAuditTrail, getAuditTrails } from '../services/audit-trail.service';

const router = Router();

/**
 * GET /api/audit-trail
 * Get audit trails with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;

    const result = await getAuditTrails(page, limit, entityType as any, entityId);

    res.json({
      success: true,
      data: result.trails,
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
 * GET /api/audit-trail/:entityType/:entityId
 * Get audit trail for a specific entity
 */
router.get('/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType } = req.params;
    let entityId = req.params.entityId;
    if (Array.isArray(entityId)) {
      entityId = entityId[0];
    }

    if (!entityId) {
      return res.status(400).json({
        success: false,
        error: 'Entity ID is required',
      });
    }

    const trails = await getAuditTrail(entityType as any, entityId);

    res.json({
      success: true,
      data: trails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
