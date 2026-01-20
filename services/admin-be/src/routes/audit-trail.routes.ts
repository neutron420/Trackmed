import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { getAuditTrail, getAuditTrails } from '../services/audit-trail.service';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(optionalAuth);

async function getManufacturerIdFromUser(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'MANUFACTURER') return null;
    
    const manufacturer = await prisma.manufacturer.findFirst({
      where: { email: user.email },
    });
    return manufacturer?.id || null;
  } catch {
    return null;
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    let manufacturerId: string | undefined;
    if (userRole === 'MANUFACTURER' && userId) {
      manufacturerId = (await getManufacturerIdFromUser(userId)) || undefined;
    }

    const result = await getAuditTrails(page, limit, entityType as any, entityId, manufacturerId);

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
