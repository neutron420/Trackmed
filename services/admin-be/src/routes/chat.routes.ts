import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getChatUsers, getChatHistory } from '../services/chat.service';
import { clientManager } from '../websocket/client-manager';

const router = Router();

/**
 * GET /api/chat/users
 * Get all users available for chat
 */
router.get('/users', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const users = await getChatUsers(userId);
    
    // Get online status from WebSocket client manager
    const onlineClients = clientManager.getAllClients();
    const onlineUserIds = new Set(onlineClients.map(c => c.userId));
    
    const usersWithStatus = users.map(u => ({
      ...u,
      isOnline: onlineUserIds.has(u.id),
    }));

    res.json({
      success: true,
      data: usersWithStatus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/chat/history
 * Get chat history (pass recipientId for 1:1 conversation)
 */
router.get('/history', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { recipientId, limit, offset } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await getChatHistory({
      userId,
      recipientId: recipientId as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to load chat history',
      });
    }

    res.json({
      success: true,
      data: result.messages ?? [],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/chat/online
 * Get currently online users
 */
router.get('/online', verifyToken, async (req: Request, res: Response) => {
  try {
    const onlineClients = clientManager.getAllClients();
    
    const uniqueUsers = new Map();
    onlineClients.forEach(client => {
      if (client.role === 'ADMIN' || client.role === 'MANUFACTURER') {
        uniqueUsers.set(client.userId, {
          userId: client.userId,
          role: client.role,
          connectedAt: client.connectedAt,
        });
      }
    });

    res.json({
      success: true,
      data: Array.from(uniqueUsers.values()),
      count: uniqueUsers.size,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
