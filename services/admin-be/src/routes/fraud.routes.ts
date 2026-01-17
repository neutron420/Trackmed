import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * GET /api/fraud/alerts
 * Get fraud alerts with pagination
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const resolved = req.query.resolved === 'true';

    const [alerts, total] = await Promise.all([
      prisma.fraudAlert.findMany({
        where: { isResolved: resolved },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.fraudAlert.count({ where: { isResolved: resolved } }),
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/fraud/alerts
 * Create a fraud alert
 */
router.post('/alerts', async (req: Request, res: Response) => {
  try {
    const {
      batchId,
      qrCodeId,
      userId,
      alertType,
      severity,
      description,
      evidence,
    } = req.body;

    if (!alertType || !description) {
      return res.status(400).json({
        success: false,
        error: 'Alert type and description are required',
      });
    }

    const alert = await prisma.fraudAlert.create({
      data: {
        batchId,
        qrCodeId,
        userId,
        alertType,
        severity: severity || 'MEDIUM',
        description,
        evidence: evidence || {},
      },
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/fraud/alerts/:id/resolve
 * Resolve a fraud alert
 */
router.patch('/alerts/:id/resolve', async (req: Request, res: Response) => {
  try {
    let { id } = req.params;
    const { resolvedBy } = req.body;

    if (Array.isArray(id)) {
      id = id[0];
    }

    const alert = await prisma.fraudAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
