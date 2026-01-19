import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { createAuditTrail } from '../services/audit-trail.service';
import { sendManufacturerVerification, sendManufacturerUpdate } from '../services/notification.service';

const router = Router();

/**
 * GET /api/manufacturer
 * Get all manufacturers with pagination
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

    const [manufacturers, total] = await Promise.all([
      prisma.manufacturer.findMany({
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
      prisma.manufacturer.count({ where }),
    ]);

    res.json({
      success: true,
      data: manufacturers,
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
 * GET /api/manufacturer/:id
 * Get manufacturer by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (Array.isArray(id)) {
      id = id[0];
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturer not found',
      });
    }

    res.json({
      success: true,
      data: manufacturer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/manufacturer
 * Create a new manufacturer
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
      walletAddress,
    } = req.body;

    if (!name || !licenseNumber || !address || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Name, license number, address, and wallet address are required',
      });
    }

    // Check if license number already exists
    const existing = await prisma.manufacturer.findUnique({
      where: { licenseNumber },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Manufacturer with this license number already exists',
      });
    }

    const manufacturer = await prisma.manufacturer.create({
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
        walletAddress,
        isVerified: false,
      },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'MANUFACTURER',
      entityId: manufacturer.id,
      action: 'CREATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { manufacturerData: manufacturer },
    });

    res.status(201).json({
      success: true,
      data: manufacturer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/manufacturer/:id
 * Update manufacturer
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (Array.isArray(id)) {
      id = id[0];
    }
    const updateData = req.body;

    const existing = await prisma.manufacturer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturer not found',
      });
    }

    // Don't allow updating license number or wallet address
    delete updateData.licenseNumber;
    delete updateData.walletAddress;

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: updateData,
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    const adminName = (req as any).user?.name || 'System';
    
    await createAuditTrail({
      entityType: 'MANUFACTURER',
      entityId: id!,
      action: 'UPDATE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { updateData, previousData: existing },
    });

    // Send notification to manufacturer user if email exists
    if (manufacturer.email) {
      try {
        const manufacturerUser = await prisma.user.findUnique({
          where: { email: manufacturer.email },
        });
        
        if (manufacturerUser) {
          const updateDetails = Object.keys(updateData).join(', ');
          await sendManufacturerUpdate(
            manufacturerUser.id,
            manufacturer.name,
            `Updated fields: ${updateDetails}`,
            adminName
          );
        }
      } catch (notifyErr) {
        console.error('Failed to send manufacturer update notification:', notifyErr);
      }
    }

    res.json({
      success: true,
      data: manufacturer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/manufacturer/:id/verify
 * Verify/unverify manufacturer
 */
router.patch('/:id/verify', async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (Array.isArray(id)) {
      id = id[0];
    }
    const { isVerified } = req.body;

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: { isVerified: isVerified === true },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    const adminName = (req as any).user?.name || 'System';
    
    await createAuditTrail({
      entityType: 'MANUFACTURER',
      entityId: id as string,
      action: 'UPDATE',
      fieldName: 'isVerified',
      oldValue: String(!isVerified),
      newValue: String(isVerified),
      performedBy: userId,
      performedByRole: userRole,
    });

    // Send notification to manufacturer user if email exists
    if (manufacturer.email) {
      try {
        const manufacturerUser = await prisma.user.findUnique({
          where: { email: manufacturer.email },
        });
        
        if (manufacturerUser) {
          await sendManufacturerVerification(
            manufacturerUser.id,
            manufacturer.name,
            isVerified,
            adminName
          );
        }
      } catch (notifyErr) {
        console.error('Failed to send manufacturer verification notification:', notifyErr);
      }
    }

    res.json({
      success: true,
      data: manufacturer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * DELETE /api/manufacturer/:id
 * Delete manufacturer (soft delete by setting isVerified to false)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (Array.isArray(id)) {
      id = id[0];
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { batches: true },
        },
      },
    });

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturer not found',
      });
    }

    if (manufacturer._count.batches > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete manufacturer with existing batches',
      });
    }

    await prisma.manufacturer.delete({
      where: { id },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'ADMIN';
    await createAuditTrail({
      entityType: 'MANUFACTURER',
      entityId: id!,
      action: 'DELETE',
      performedBy: userId,
      performedByRole: userRole,
      metadata: { manufacturerData: manufacturer },
    });

    res.json({
      success: true,
      message: 'Manufacturer deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
