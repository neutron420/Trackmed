import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const type = req.query.type as string | undefined;
    const severity = req.query.severity as string | undefined;

    // Build where clause
    const where: any = {
      OR: [
        { targetUserIds: { has: user.userId } },
        { targetRoles: { has: user.role as UserRole } },
      ],
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }
    if (severity) {
      where.severity = severity;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          batch: {
            select: {
              id: true,
              batchNumber: true,
              batchHash: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/notification/unread-count
 * Get count of unread notifications for the current user
 */
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const count = await prisma.notification.count({
      where: {
        isRead: false,
        OR: [
          { targetUserIds: { has: user.userId } },
          { targetRoles: { has: user.role as UserRole } },
        ],
      },
    });

    res.json({
      success: true,
      count,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/notification/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    let { id } = req.params;
    if (Array.isArray(id)) {
      id = id[0];
    }

    // Verify the notification is for this user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Check if user has access to this notification
    const hasAccess =
      notification.targetUserIds.includes(user.userId) ||
      notification.targetRoles.includes(user.role as UserRole);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * PATCH /api/notification/read-all
 * Mark all notifications as read for the current user
 */
router.patch('/read-all', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const result = await prisma.notification.updateMany({
      where: {
        isRead: false,
        OR: [
          { targetUserIds: { has: user.userId } },
          { targetRoles: { has: user.role as UserRole } },
        ],
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      count: result.count,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * DELETE /api/notification/:id
 * Delete a notification
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    let { id } = req.params;
    if (Array.isArray(id)) {
      id = id[0];
    }

    // Verify the notification is for this user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    // Check if user has access to this notification
    const hasAccess =
      notification.targetUserIds.includes(user.userId) ||
      notification.targetRoles.includes(user.role as UserRole);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
