import prisma from '../config/database';

// Chat message interface (for saving)
export interface ChatMessageData {
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  message: string;
  timestamp: Date;
}

/**
 * Save chat message to database (persists so history survives refresh)
 */
export async function saveChatMessage(data: ChatMessageData) {
  try {
    await prisma.chatMessage.create({
      data: {
        senderId: data.senderId,
        recipientId: data.recipientId || null,
        message: data.message,
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to persist chat message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get chat history for a conversation (1:1) or all messages for user
 * When recipientId is set: returns messages between userId and recipientId, oldest first.
 */
export async function getChatHistory(params: {
  userId: string;
  recipientId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const limit = Math.min(params.limit ?? 50, 200);
    const offset = params.offset ?? 0;

    if (params.recipientId) {
      // 1:1 conversation: (A->B) or (B->A)
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: params.userId, recipientId: params.recipientId },
            { senderId: params.recipientId, recipientId: params.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      const list = messages.map((m) => ({
        id: m.id,
        message: m.message,
        senderId: m.senderId,
        senderName: m.sender.name || m.sender.email,
        senderRole: m.sender.role,
        recipientId: m.recipientId ?? undefined,
        timestamp: m.createdAt.toISOString(),
      }));

      return { success: true, messages: list };
    }

    // No recipient: return recent messages where user is sender or recipient
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: params.userId },
          { recipientId: params.userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const list = messages.map((m) => ({
      id: m.id,
      message: m.message,
      senderId: m.senderId,
      senderName: m.sender.name || m.sender.email,
      senderRole: m.sender.role,
      recipientId: m.recipientId ?? undefined,
      timestamp: m.createdAt.toISOString(),
    }));

    return { success: true, messages: list };
  } catch (error: any) {
    console.error('Failed to get chat history:', error);
    return { success: false, error: error.message, messages: [] };
  }
}

/**
 * Get online users for chat
 */
export async function getOnlineUsers() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'MANUFACTURER'],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return users.map((u: { id: string; name: string | null; email: string; role: string }) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
    role: u.role,
    isOnline: false,
  }));
}

/**
 * Get chat users with their status
 */
export async function getChatUsers(currentUserId: string) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'MANUFACTURER'],
      },
      id: {
        not: currentUserId,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users.map((u: { id: string; name: string | null; email: string; role: string }) => ({
    id: u.id,
    name: u.name || u.email.split('@')[0],
    email: u.email,
    role: u.role,
    avatar: u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase(),
  }));
}
