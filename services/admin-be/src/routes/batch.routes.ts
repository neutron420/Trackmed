import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAndGetBatch, verifyQRCode, logScan } from '../services/batch.service';
import { registerBatch, updateBatchStatus } from '../services/batch-registration.service';
import { createAuditTrail } from '../services/audit-trail.service';
import { sendBatchRecall, sendBatchStatusChanged, sendNotification } from '../services/notification.service';
import prisma from '../config/database';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const router = Router();

const asString = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;


router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      batchHash,
      batchNumber,
      manufacturingDate,
      expiryDate,
      manufacturerId,
      medicineId,
      quantity,
      invoiceNumber,
      invoiceDate,
      gstNumber,
      warehouseLocation,
      warehouseAddress,
      imageUrl,
      manufacturerWalletPrivateKey, // Base58 encoded private key
    } = req.body;

    // Validate required fields (manufacturerId is optional - will be found by wallet address)
    if (!batchHash || !batchNumber || !manufacturingDate || !expiryDate || 
        !medicineId || !quantity || !manufacturerWalletPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Reconstruct wallet from private key
    let manufacturerWallet: Keypair;
    try {
      // Validate base58 format
      if (!manufacturerWalletPrivateKey || typeof manufacturerWalletPrivateKey !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet private key format',
        });
      }

      // Trim whitespace from the key
      const trimmedKey = manufacturerWalletPrivateKey.trim();

      // Check if it's a demo/test key
      if (trimmedKey === 'demo-key' || trimmedKey === 'test-key') {
        return res.status(400).json({
          success: false,
          error: 'Please use a valid Solana wallet private key. Demo keys are not supported for blockchain registration.',
        });
      }

      // Validate key format (base58 should only contain alphanumeric characters except 0, O, I, l)
      if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedKey)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet private key format. The key must be base58-encoded (no 0, O, I, or l characters).',
        });
      }

      // Decode base58 to bytes
      const privateKeyBytes = bs58.decode(trimmedKey);
      
      // Validate key length (Solana private keys are 64 bytes)
      if (privateKeyBytes.length !== 64) {
        return res.status(400).json({
          success: false,
          error: 'Invalid private key length. Solana private keys must be 64 bytes.',
        });
      }

      // Construct Keypair from secret key bytes
      manufacturerWallet = Keypair.fromSecretKey(privateKeyBytes);
    } catch (error: any) {
      if (error?.message && error.message.includes('Non-base58')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet private key format. The key must be base58-encoded.',
        });
      }
      return res.status(400).json({
        success: false,
        error: `Invalid wallet private key: ${error?.message || 'Unknown error'}`,
      });
    }

    // Register batch (manufacturerId will be found by wallet address)
    const result = await registerBatch(manufacturerWallet, {
      batchHash,
      batchNumber,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      manufacturerId: manufacturerId || '', // Optional - will be found by wallet address
      medicineId,
      quantity: parseInt(quantity),
      invoiceNumber,
      ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
      gstNumber,
      warehouseLocation,
      warehouseAddress,
      imageUrl,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'MANUFACTURER';
    if (result.batchId) {
      await createAuditTrail({
        entityType: 'BATCH',
        entityId: result.batchId,
        action: 'CREATE',
        performedBy: userId,
        performedByRole: userRole,
        metadata: { batchNumber, batchHash },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        batchId: result.batchId,
        blockchainTxHash: result.blockchainTxHash,
        blockchainPda: result.blockchainPda,
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
 * PATCH /api/batch/:batchHash/status
 * Update batch status on both blockchain and database
 */
router.patch('/:batchHash/status', async (req: Request, res: Response) => {
  try {
    const batchHash = asString(req.params.batchHash);
    const { newStatus, manufacturerWalletPrivateKey } = req.body;

    if (!newStatus || (newStatus !== 'VALID' && newStatus !== 'RECALLED')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be VALID or RECALLED',
      });
    }

    if (!manufacturerWalletPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'Manufacturer wallet private key is required',
      });
    }

    // Reconstruct wallet from private key
    const privateKeyBytes = bs58.decode(manufacturerWalletPrivateKey);
    const manufacturerWallet = Keypair.fromSecretKey(privateKeyBytes);

    if (!batchHash) {
      return res.status(400).json({
        success: false,
        error: 'Batch hash is required',
      });
    }
    
    const result = await updateBatchStatus(manufacturerWallet, batchHash, newStatus);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // Get batch for audit trail and notification
    const batch = await prisma.batch.findUnique({
      where: { batchHash },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit trail
    const userId = (req as any).user?.userId || 'system';
    const userRole = (req as any).user?.role || 'MANUFACTURER';
    if (batch) {
      await createAuditTrail({
        entityType: 'BATCH',
        entityId: batch.id,
        action: 'STATUS_CHANGE',
        fieldName: 'status',
        oldValue: batch.status,
        newValue: newStatus,
        performedBy: userId,
        performedByRole: userRole,
      });

      // Send notification for any status change (admins need to know all manufacturer actions)
      if (batch.batchNumber) {
        // Critical notification for recalls (notifies admins)
        if (newStatus === 'RECALLED') {
          await sendBatchRecall(batch.id, batch.batchNumber);
        }
        
        // General notification for all status changes (notifies admins)
        await sendBatchStatusChanged(
          batch.id,
          batch.batchNumber,
          batch.status,
          newStatus,
          batch.manufacturer.name
        );

        // Also notify the manufacturer user about their batch status change
        if (batch.manufacturer.email) {
          try {
            const manufacturerUser = await prisma.user.findUnique({
              where: { email: batch.manufacturer.email },
            });
            
            if (manufacturerUser) {
              await sendNotification({
                type: 'BATCH_STATUS_CHANGED',
                batchId: batch.id,
                message: `Your batch ${batch.batchNumber} status has been changed from ${batch.status} to ${newStatus}`,
                severity: newStatus === 'RECALLED' ? 'CRITICAL' : 'INFO',
                targetUserIds: [manufacturerUser.id],
                metadata: {
                  batchNumber: batch.batchNumber,
                  oldStatus: batch.status,
                  newStatus,
                },
              });
            }
          } catch (notifyErr) {
            console.error('Failed to send manufacturer notification for batch status change:', notifyErr);
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        blockchainTxHash: result.blockchainTxHash,
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
 * GET /api/batch
 * List batches (database only)
 * Used by manufacturer dashboard batches page
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(asString(req.query.page as any) || '1', 10) || 1;
    const limit = parseInt(asString(req.query.limit as any) || '20', 10) || 20;
    const skip = (page - 1) * limit;
    const search = asString(req.query.search as any);

    const where: any = {};
    if (search) {
      where.OR = [
        { batchNumber: { contains: search, mode: 'insensitive' } },
        { batchHash: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { medicine: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          medicine: {
            select: {
              name: true,
              strength: true,
            },
          },
          _count: {
            select: {
              qrCodes: true,
            },
          },
        },
      }),
      prisma.batch.count({ where }),
    ]);

    return res.json({
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
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/batch/:batchHash
 * Verify batch using blockchain (internal) and return database data only
 * Frontend receives ONLY database data
 */
router.get('/:batchHash', async (req: Request, res: Response) => {
  try {
    const batchHash = asString(req.params.batchHash);

    if (!batchHash) {
      return res.status(400).json({
        success: false,
        error: 'Batch hash is required',
      });
    }
    
    const result = await verifyAndGetBatch(batchHash);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    // Return ONLY database data (blockchain verification is internal)
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
 * POST /api/batch/verify-qr
 * Verify QR code and return database data only
 * Blockchain verification happens internally
 */
router.post('/verify-qr', async (req: Request, res: Response) => {
  try {
    const { 
      qrCode, 
      userId, 
      deviceId, 
      deviceModel, 
      deviceOS, 
      appVersion, 
      locationLat, 
      locationLng, 
      locationAddress, 
      scanType 
    } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code is required',
      });
    }

    const result = await verifyQRCode(qrCode);

    if (!result.success || !result.data) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    // Log the scan
    await logScan({
      qrCodeId: result.data.qrCode.id,
      batchId: result.data.id,
      userId,
      deviceId,
      deviceModel,
      deviceOS,
      appVersion,
      locationLat,
      locationLng,
      locationAddress,
      scanType: scanType || 'VERIFICATION',
      blockchainVerified: result.data.isVerified,
      blockchainStatus: result.data.status,
    });

    // Return ONLY database data (blockchain verification is internal)
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

export default router;
