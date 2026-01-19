import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { createAuditTrail } from '../services/audit-trail.service';

const router = Router();

/**
 * GET /api/distributor
 * Get all distributors with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: any = {};
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
            select: { batches: true },
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

/**
 * GET /api/distributor/:id
 * Get distributor by ID
 */
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

/**
 * POST /api/distributor
 * Create a new distributor
 */
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

    // Check if license number already exists
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

    // Create audit trail
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

/**
 * PATCH /api/distributor/:id
 * Update distributor
 */
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

    // Don't allow updating license number
    delete updateData.licenseNumber;

    const normalizedId = Array.isArray(id) ? id[0] : id;
    const distributor = await prisma.distributor.update({
      where: { id: normalizedId },
      data: updateData,
    });

    // Create audit trail
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

/**
 * PATCH /api/distributor/:id/verify
 * Verify/unverify distributor
 */
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

    // Create audit trail
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

/**
 * PATCH /api/distributor/:id/status
 * Activate/deactivate distributor
 */
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

    // Create audit trail
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

/**
 * DELETE /api/distributor/:id
 * Delete distributor
 */
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

    // Create audit trail
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
