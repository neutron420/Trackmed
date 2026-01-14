import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { config } from '../config';
import { JwtPayload } from '../middleware/auth.middleware';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

/**
 * Generate and store refresh token
 */
const generateRefreshToken = async (
  userId: string,
  deviceId?: string,
  deviceName?: string
): Promise<string> => {
  const token = uuidv4();
  
  // Parse refresh expiry (e.g., "7d" -> 7 days)
  const expiresIn = config.jwt.refreshExpiresIn;
  const days = parseInt(expiresIn.replace('d', '')) || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      deviceId,
      deviceName,
      expiresAt,
    },
  });

  return token;
};

/**
 * Register a new consumer user
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    // Create user with CONSUMER role
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        phone: input.phone,
        role: 'CONSUMER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Create empty cart for user
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(user.id);

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    console.error('Register error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated',
      };
    }

    // Only allow CONSUMER role
    if (user.role !== 'CONSUMER' && user.role !== 'SCANNER') {
      return {
        success: false,
        error: 'Invalid account type for this app',
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(
      user.id,
      input.deviceId,
      input.deviceName
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResult> => {
  try {
    // Find refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: 'Invalid refresh token',
      };
    }

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      return {
        success: false,
        error: 'Token has been revoked',
      };
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      return {
        success: false,
        error: 'Refresh token expired',
      };
    }

    // Check if user is still active
    if (!tokenRecord.user.isActive) {
      return {
        success: false,
        error: 'User account is inactive',
      };
    }

    // Generate new access token
    const payload: JwtPayload = {
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    };

    const accessToken = generateAccessToken(payload);

    return {
      success: true,
      accessToken,
    };
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return {
      success: false,
      error: error.message || 'Token refresh failed',
    };
  }
};

/**
 * Logout - revoke refresh token
 */
export const logoutUser = async (refreshToken: string): Promise<AuthResult> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (userId: string): Promise<AuthResult> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Logout all error:', error);
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens (force re-login)
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.message || 'Password change failed',
    };
  }
};
