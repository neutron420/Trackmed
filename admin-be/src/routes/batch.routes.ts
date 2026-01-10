import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyAndGetBatch, verifyQRCode, logScan } from '../services/batch.service';
import { registerBatch, updateBatchStatus } from '../services/batch-registration.service';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const router = Router();

/**
 * POST /api/batch/register
 * Register a new batch on both blockchain and database
 * Requires manufacturer wallet private key in request
 */
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
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
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
    const { batchHash } = req.params;
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
    const { batchHash } = req.params;

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
