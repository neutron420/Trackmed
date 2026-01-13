import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * GET /api/scan/logs
 * Get scan logs with pagination
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.scanLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          qrCode: true,
          batch: {
            include: {
              medicine: true,
              manufacturer: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.scanLog.count(),
    ]);

    res.json({
      success: true,
      data: logs,
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

router.get('/logs/:batchId', async (req: Request, res: Response) => {
  try {
    let batchId = req.params.batchId;
    if (Array.isArray(batchId)) {
      batchId = batchId[0];
    }

    const logs = await prisma.scanLog.findMany({
      where: { batchId },
      orderBy: { createdAt: 'desc' },
      include: {
        qrCode: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
