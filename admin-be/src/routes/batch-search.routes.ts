import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { BatchStatus, LifecycleStatus } from '@prisma/client';

const router = Router();

/**
 * GET /api/batch-search
 * Advanced batch search with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const {
      batchNumber,
      batchHash,
      manufacturerId,
      medicineId,
      status,
      lifecycleStatus,
      distributorId,
      pharmacyId,
      startDate,
      endDate,
      expiryStartDate,
      expiryEndDate,
      search,
    } = req.query;

    const where: any = {};

    if (batchNumber) {
      where.batchNumber = { contains: batchNumber as string, mode: 'insensitive' };
    }

    if (batchHash) {
      where.batchHash = batchHash as string;
    }

    if (manufacturerId) {
      where.manufacturerId = manufacturerId as string;
    }

    if (medicineId) {
      where.medicineId = medicineId as string;
    }

    if (status) {
      where.status = status as BatchStatus;
    }

    if (lifecycleStatus) {
      where.lifecycleStatus = lifecycleStatus as LifecycleStatus;
    }

    if (distributorId) {
      where.distributorId = distributorId as string;
    }

    if (pharmacyId) {
      where.pharmacyId = pharmacyId as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (expiryStartDate || expiryEndDate) {
      where.expiryDate = {};
      if (expiryStartDate) {
        where.expiryDate.gte = new Date(expiryStartDate as string);
      }
      if (expiryEndDate) {
        where.expiryDate.lte = new Date(expiryEndDate as string);
      }
    }

    // General search across multiple fields
    if (search) {
      where.OR = [
        { batchNumber: { contains: search as string, mode: 'insensitive' } },
        { batchHash: { contains: search as string, mode: 'insensitive' } },
        { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manufacturer: {
            select: {
              id: true,
              name: true,
              licenseNumber: true,
            },
          },
          medicine: {
            select: {
              id: true,
              name: true,
              genericName: true,
              strength: true,
            },
          },
          distributor: {
            select: {
              id: true,
              name: true,
            },
          },
          pharmacy: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              qrCodes: true,
              scanLogs: true,
            },
          },
        },
      }),
      prisma.batch.count({ where }),
    ]);

    res.json({
      success: true,
      data: batches,
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

export default router;
