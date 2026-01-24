import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getAdminStats } from '../services/admin.service';

const router = Router();

/**
 * GET /api/admin/stats
 * Get comprehensive admin dashboard statistics
 * Requires authentication
 */
router.get('/stats', verifyToken, async (req: Request, res: Response) => {
  try {
    const result = await getAdminStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
