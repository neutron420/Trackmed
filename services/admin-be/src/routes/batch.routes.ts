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

    // Validate required fields
    if (!batchHash || !batchNumber || !manufacturingDate || !expiryDate || 
        !manufacturerId || !medicineId || !quantity || !manufacturerWalletPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Reconstruct wallet from private key
    const privateKeyBytes = bs58.decode(manufacturerWalletPrivateKey);
    const manufacturerWallet = Keypair.fromSecretKey(privateKeyBytes);

    // Register batch
    const result = await registerBatch(manufacturerWallet, {
      batchHash,
      batchNumber,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      manufacturerId,
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
