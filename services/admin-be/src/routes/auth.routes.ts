import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';
import { authLimiter } from '../middleware/security.middleware';
import { validate, schemas } from '../middleware/validation.middleware';

const router = Router();

// SECURITY: JWT_SECRET must be set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set!');
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Apply rate limiting to auth routes
router.post('/register', authLimiter, validate(schemas.register), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role }: RegisterRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required',
      });
    }

    if (role !== 'ADMIN' && role !== 'MANUFACTURER') {
      return res.status(400).json({
        success: false,
        error: 'Only ADMIN and MANUFACTURER roles can register',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register user',
    });
  }
});

router.post('/login', authLimiter, validate(schemas.login), async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to login',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get profile',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset - generates a reset token
 */
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success even if user not found (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      });
    }

    // Generate a secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in user record (we'll use the refreshTokens table for this)
    // Delete any existing reset tokens for this user first
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        deviceName: 'PASSWORD_RESET',
      },
    });

    // Create new reset token
    await prisma.refreshToken.create({
      data: {
        token: resetTokenHash,
        userId: user.id,
        deviceName: 'PASSWORD_RESET',
        expiresAt: resetTokenExpiry,
      },
    });

    // In production, you would send an email here with the reset link
    // For now, we'll return the token in the response (remove in production!)
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
    console.log(`[Password Reset] Reset URL: /reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
      // Remove this in production - only for development/testing
      ...(process.env.NODE_ENV !== 'production' && { 
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
      }),
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, email, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Hash the provided token to compare with stored hash
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetToken = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        token: tokenHash,
        deviceName: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
        isRevoked: false,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete the used reset token
    await prisma.refreshToken.delete({
      where: { id: resetToken.id },
    });

    // Also invalidate all other refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
});

/**
 * POST /api/auth/verify-reset-token
 * Verify if a reset token is valid (for frontend validation)
 */
router.post('/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Token and email are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token',
      });
    }

    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        token: tokenHash,
        deviceName: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
        isRevoked: false,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify token',
    });
  }
});

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
router.patch('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { name, currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const updateData: any = {};
    
    // Update name if provided
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }
      
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
});

export default router;
