import jwt from 'jsonwebtoken';
import WebSocket from 'ws';
import prisma from '../config/database';
import { AuthenticatedSocket } from '../types/websocket';

// Local UserRole type mirroring Prisma enum `UserRole`
type UserRoleType =
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'PHARMACY'
  | 'SCANNER'
  | 'CONSUMER';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthPayload {
  userId: string;
  role: string;
}

export async function authenticateWebSocket(
  socket: AuthenticatedSocket,
  token: string
): Promise<{ success: boolean; userId?: string; role?: string; error?: string }> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { success: false, error: 'User account is inactive' };
    }

    socket.userId = user.id;
    socket.role = user.role as UserRoleType;

    return {
      success: true,
      userId: user.id,
      role: user.role,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}

export function sendAuthError(socket: WebSocket, message: string): void {
  socket.send(
    JSON.stringify({
      type: 'ERROR',
      error: message,
    })
  );
}
