import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { createAuditTrail } from '../services/audit-trail.service';

const router = Router();

/**
 * GET /api/pharmacy
 * Get all pharmacies with pagination
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

    const [pharmacies, total] = await Promise.all([
      prisma.pharmacy.findMany({
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
      prisma.pharmacy.count({ where }),
    ]);

    res.json({
      success: true,
      data: pharmacies,
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
 * GET /api/pharmacy/:id
 * Get pharmacy by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pharmacyId = Array.isArray(id) ? id[0] : id;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found',
      });
    }

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/pharmacy
 * Create a new pharmacy
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
    const existing = await prisma.pharmacy.findUnique({
      where: { licenseNumber },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Pharmacy with this license number already exists',
      });
    }

    const pharmacy = await prisma.pharmacy.create({
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
      entityType: 'PHARMACY',
      entityId: pharmacy.id,
      action: 'CREATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { pharmacyData: pharmacy },
    });

    res.status(201).json({
      success: true,
      data: pharmacy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/pharmacy/:id
 * Update pharmacy
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const pharmacyId = Array.isArray(id) ? id[0] : id;

    const existing = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found',
      });
    }

    // Don't allow updating license number
    delete updateData.licenseNumber;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: updateData,
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'PHARMACY',
      entityId: pharmacyId!,
      action: 'UPDATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { updateData, previousData: existing },
    });

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/pharmacy/:id/verify
 * Verify/unverify pharmacy
 */
router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const pharmacyId = Array.isArray(id) ? id[0] : id;

    const pharmacy = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: { isVerified: isVerified === true },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'PHARMACY',
      entityId: pharmacyId!,
      action: 'UPDATE',
      fieldName: 'isVerified',
      oldValue: String(!isVerified),
      newValue: String(isVerified),
      performedBy: userId,
      performedByRole: userRole,
    });

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * DELETE /api/pharmacy/:id
 * Delete pharmacy
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pharmacyId = Array.isArray(id) ? id[0] : id;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found',
      });
    }

    if (pharmacy._count.batches > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete pharmacy with existing batches',
      });
    }

    await prisma.pharmacy.delete({
      where: { id: pharmacyId },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'PHARMACY',
      entityId: pharmacyId!,
      action: 'DELETE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { pharmacyData: pharmacy },
    });

    res.json({
      success: true,
      message: 'Pharmacy deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
