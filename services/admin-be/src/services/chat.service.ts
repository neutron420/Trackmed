import prisma from '../config/database';

// Chat message interface
export interface ChatMessageData {
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  message: string;
  timestamp: Date;
}

/**
 * Save chat message to database
 */
export async function saveChatMessage(data: ChatMessageData) {
  try {
    // Check if ChatMessage model exists, if not use a simple storage approach
    const message = await prisma.$queryRaw`
      INSERT INTO chat_messages (id, sender_id, sender_name, sender_role, recipient_id, message, created_at)
      VALUES (gen_random_uuid(), ${data.senderId}, ${data.senderName}, ${data.senderRole}, ${data.recipientId || null}, ${data.message}, ${data.timestamp})
      ON CONFLICT DO NOTHING
      RETURNING *
    `.catch(() => null);

    return { success: true, message };
  } catch (error: any) {
    // If table doesn't exist, just log and continue (messages still go through WebSocket)
    console.log('Chat message not persisted (table may not exist):', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get chat history
 */
export async function getChatHistory(params: {
  userId?: string;
  recipientId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    // Try to fetch from database
    const messages = await prisma.$queryRaw`
      SELECT * FROM chat_messages 
      WHERE (sender_id = ${params.userId} OR recipient_id = ${params.userId} OR recipient_id IS NULL)
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `.catch(() => []);

    return { success: true, messages };
  } catch (error: any) {
    return { success: false, error: error.message, messages: [] };
  }
}

/**
 * Get online users for chat
 */
export async function getOnlineUsers() {
  // Get all users who can chat (ADMIN and MANUFACTURER)
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

  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
    role: u.role,
    // Online status would come from WebSocket client manager
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

  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email.split('@')[0],
    email: u.email,
    role: u.role,
    avatar: u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase(),
  }));
}
