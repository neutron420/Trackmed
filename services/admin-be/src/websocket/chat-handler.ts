import { WebSocketClient } from '../types/websocket';
import { clientManager } from './client-manager';
import prisma from '../config/database';

// Local UserRole type mirroring Prisma enum `UserRole`
type UserRoleType =
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'PHARMACY'
  | 'SCANNER'
  | 'CONSUMER';
export interface ChatMessage {
  type: 'CHAT';
  payload: {
    message: string;
    recipientId?: string;
    timestamp?: string;
  };
}

export async function handleChatMessage(
  message: ChatMessage,
  senderUserId: string,
  senderRole: UserRoleType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { payload } = message;

    if (!payload.message || typeof payload.message !== 'string') {
      return {
        success: false,
        error: 'Message is required and must be a string',
      };
    }

    if (payload.message.trim().length === 0) {
      return {
        success: false,
        error: 'Message cannot be empty',
      };
    }

    if (payload.message.length > 1000) {
      return {
        success: false,
        error: 'Message too long (max 1000 characters)',
      };
    }

    if (senderRole !== 'ADMIN' && senderRole !== 'MANUFACTURER') {
      return {
        success: false,
        error: 'Only ADMIN and MANUFACTURER users can chat',
      };
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!sender) {
      return {
        success: false,
        error: 'Sender not found',
      };
    }

    const chatData = {
      type: 'CHAT_RECEIVED' as const,
      payload: {
        message: payload.message,
        senderId: senderUserId,
        senderName: sender.name || sender.email,
        senderRole: sender.role,
        recipientId: payload.recipientId,
        timestamp: payload.timestamp || new Date().toISOString(),
      },
    };

    const allClients = clientManager.getAllClients();
    const messageStr = JSON.stringify(chatData);

    if (payload.recipientId) {
      const recipientClients = allClients.filter(
        (client) => client.userId === payload.recipientId && 
                   (client.role === 'ADMIN' || client.role === 'MANUFACTURER')
      );

      if (recipientClients.length === 0) {
        return {
          success: false,
          error: 'Recipient not connected or not authorized',
        };
      }

      recipientClients.forEach((client) => {
        if (client.socket.readyState === 1) {
          client.socket.send(messageStr);
        }
      });

      if (senderUserId !== payload.recipientId) {
        const senderClients = allClients.filter(
          (client) => client.userId === senderUserId
        );
        senderClients.forEach((client) => {
          if (client.socket.readyState === 1) {
            client.socket.send(messageStr);
          }
        });
      }

      console.log(
        `Chat message sent from ${senderUserId} (${senderRole}) to ${payload.recipientId}`
      );
    } else {
      const adminAndManufacturerClients = allClients.filter(
        (client) => client.role === 'ADMIN' || client.role === 'MANUFACTURER'
      );

      adminAndManufacturerClients.forEach((client) => {
        if (client.socket.readyState === 1) {
          client.socket.send(messageStr);
        }
      });

      console.log(
        `Broadcast chat message from ${senderUserId} (${senderRole}) to all ADMIN/MANUFACTURER clients`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error handling chat message:', error);
    return {
      success: false,
      error: error.message || 'Failed to process chat message',
    };
  }
}

export function validateChatMessage(message: any): message is ChatMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (message.type !== 'CHAT') {
    return false;
  }

  if (!message.payload || typeof message.payload !== 'object') {
    return false;
  }

  const { payload } = message;

  return (
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0 &&
    payload.message.length <= 1000 &&
    (payload.recipientId === undefined || typeof payload.recipientId === 'string')
  );
}
