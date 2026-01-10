import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

router.post('/register', async (req: Request, res: Response) => {
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
      { expiresIn: '24h' }
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

router.post('/login', async (req: Request, res: Response) => {
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
      { expiresIn: '24h' }
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

export default router;
