import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { uploadImageToR2, validateImageFile } from '../services/r2-upload.service';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * POST /api/upload/image
 * Upload image to Cloudflare R2
 * Requires authentication
 */
router.post('/image', verifyToken, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Express Request type doesn't include multer's `file` by default
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Get folder from query (batches, medicines, etc.)
    const folder = (req.query.folder as string) || 'batches';

    // Upload to R2
    const result = await uploadImageToR2(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload image',
      });
    }

    res.json({
      success: true,
      data: {
        url: result.url,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
