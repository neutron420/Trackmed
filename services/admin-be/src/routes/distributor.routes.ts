import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { createAuditTrail } from '../services/audit-trail.service';
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
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const mineOnly = req.query.mine === 'true';
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const where: any = {};
    
    if (userRole === 'MANUFACTURER' && userId && mineOnly) {
      const manufacturerId = await getManufacturerIdFromUser(userId);
      if (manufacturerId) {
        const shipments = await prisma.shipment.findMany({
          where: {
            batch: { manufacturerId },
          },
          select: { distributorId: true },
          distinct: ['distributorId'],
        });
        const distributorIds = shipments.map(s => s.distributorId);
        
        const batches = await prisma.batch.findMany({
          where: {
            manufacturerId,
            distributorId: { not: null },
          },
          select: { distributorId: true },
          distinct: ['distributorId'],
        });
        const batchDistributorIds = batches.map(b => b.distributorId).filter(Boolean) as string[];
        
        const allDistributorIds = [...new Set([...distributorIds, ...batchDistributorIds])];
        
        if (allDistributorIds.length > 0) {
          where.id = { in: allDistributorIds };
        } else {
          return res.json({
            success: true,
            data: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [distributors, total] = await Promise.all([
      prisma.distributor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { batches: true, shipments: true },
          },
        },
      }),
      prisma.distributor.count({ where }),
    ]);

    res.json({
      success: true,
      data: distributors,
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

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const distributorId = Array.isArray(id) ? id[0] : id;

    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
      });
    }

    res.json({
      success: true,
      data: distributor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      licenseNumber,
      address,
      city,
      state,
      country,
      phone,
      email,
      gstNumber,
    } = req.body;

    if (!name || !licenseNumber || !address) {
      return res.status(400).json({
        success: false,
        error: 'Name, license number, and address are required',
      });
    }

    const existing = await prisma.distributor.findUnique({
      where: { licenseNumber },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Distributor with this license number already exists',
      });
    }

    const distributor = await prisma.distributor.create({
      data: {
        name,
        licenseNumber,
        address,
        city,
        state,
        country: country || 'India',
        phone,
        email,
        gstNumber,
        isVerified: false,
      },
    });

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'DISTRIBUTOR',
      entityId: distributor.id,
      action: 'CREATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { distributorData: distributor },
    });

    res.status(201).json({
      success: true,
      data: distributor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const distributorId = Array.isArray(id) ? id[0] : id;

    const existing = await prisma.distributor.findUnique({
      where: { id: distributorId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
      });
    }

    delete updateData.licenseNumber;

    const normalizedId = Array.isArray(id) ? id[0] : id;
    const distributor = await prisma.distributor.update({
      where: { id: normalizedId },
      data: updateData,
    });

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'DISTRIBUTOR',
      entityId: distributorId ?? '',
      action: 'UPDATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { updateData, previousData: existing },
    });

    res.json({
      success: true,
      data: distributor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const distributorId = Array.isArray(id) ? id[0] : id;
    if (!distributorId) {
      return res.status(400).json({
        success: false,
        error: 'Distributor ID is required',
      });
    }

    const distributor = await prisma.distributor.update({
      where: { id: distributorId },
      data: { isVerified: isVerified === true },
    });

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'DISTRIBUTOR',
      entityId: distributorId ?? '',
      action: 'UPDATE',
      fieldName: 'isVerified',
      oldValue: String(!isVerified),
      newValue: String(isVerified),
      performedBy: userId,
      performedByRole: userRole,
    });

    res.json({
      success: true,
      data: distributor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const distributorId = Array.isArray(id) ? id[0] : id;
    if (!distributorId) {
      return res.status(400).json({
        success: false,
        error: 'Distributor ID is required',
      });
    }

    const distributor = await prisma.distributor.update({
      where: { id: distributorId },
      data: { isActive: isActive === true } as any,
    });

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'DISTRIBUTOR',
      entityId: distributorId ?? '',
      action: 'UPDATE',
      fieldName: 'isActive',
      oldValue: String(!isActive),
      newValue: String(isActive),
      performedBy: userId,
      performedByRole: userRole,
    });

    res.json({
      success: true,
      data: distributor,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const distributorId = Array.isArray(id) ? id[0] : id;

    const distributor = await prisma.distributor.findUnique({
      where: { id: distributorId },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!distributor) {
      return res.status(404).json({
        success: false,
        error: 'Distributor not found',
      });
    }

    if (distributor._count.batches > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete distributor with existing batches',
      });
    }

    const normalizedId = Array.isArray(id) ? id[0] : id;
    await prisma.distributor.delete({
      where: { id: normalizedId },
    });

    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'DISTRIBUTOR',
      entityId: distributorId ?? '',
      action: 'DELETE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { distributorData: distributor },
    });

    res.json({
      success: true,
      message: 'Distributor deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
