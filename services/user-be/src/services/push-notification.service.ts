import prisma from '../config/database';

// OneSignal API configuration
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || '';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || '';
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

interface ServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface SendNotificationOptions {
  title: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
  imageUrl?: string;
}

interface OneSignalResponse {
  id?: string;
  recipients?: number;
  errors?: string[];
}

/**
 * Register a push token (OneSignal player ID) for a user
 */
export const registerPushToken = async (
  userId: string,
  playerId: string,
  deviceType?: string,
  deviceModel?: string
): Promise<ServiceResult> => {
  try {
    // Check if token already exists
    const existingToken = await prisma.pushToken.findUnique({
      where: { playerId },
    });

    if (existingToken) {
      // If same user, just update
      if (existingToken.userId === userId) {
        const updated = await prisma.pushToken.update({
          where: { playerId },
          data: {
            isActive: true,
            deviceType,
            deviceModel,
            updatedAt: new Date(),
          },
        });
        return { success: true, data: updated };
      }

      // If different user, transfer token to new user
      const updated = await prisma.pushToken.update({
        where: { playerId },
        data: {
          userId,
          isActive: true,
          deviceType,
          deviceModel,
          updatedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    }

    // Create new token
    const pushToken = await prisma.pushToken.create({
      data: {
        userId,
        playerId,
        deviceType,
        deviceModel,
        isActive: true,
      },
    });

    return { success: true, data: pushToken };
  } catch (error: any) {
    console.error('Error registering push token:', error);
    return { success: false, error: error.message || 'Failed to register push token' };
  }
};

/**
 * Unregister/deactivate a push token
 */
export const unregisterPushToken = async (
  userId: string,
  playerId: string
): Promise<ServiceResult> => {
  try {
    const token = await prisma.pushToken.findFirst({
      where: {
        userId,
        playerId,
      },
    });

    if (!token) {
      return { success: false, error: 'Push token not found' };
    }

    await prisma.pushToken.update({
      where: { id: token.id },
      data: { isActive: false },
    });

    return { success: true, data: { message: 'Push token unregistered' } };
  } catch (error: any) {
    console.error('Error unregistering push token:', error);
    return { success: false, error: error.message || 'Failed to unregister push token' };
  }
};

/**
 * Get all active push tokens for a user
 */
export const getUserPushTokens = async (userId: string): Promise<ServiceResult> => {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return { success: true, data: tokens };
  } catch (error: any) {
    console.error('Error getting push tokens:', error);
    return { success: false, error: error.message || 'Failed to get push tokens' };
  }
};

/**
 * Send push notification to specific user(s) via OneSignal
 */
export const sendPushNotification = async (
  userIds: string | string[],
  options: SendNotificationOptions
): Promise<ServiceResult> => {
  try {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.warn('OneSignal not configured, skipping push notification');
      return { success: false, error: 'OneSignal not configured' };
    }

    const userIdArray = Array.isArray(userIds) ? userIds : [userIds];

    // Get all active player IDs for the users
    const tokens = await prisma.pushToken.findMany({
      where: {
        userId: { in: userIdArray },
        isActive: true,
      },
      select: { playerId: true },
    });

    if (tokens.length === 0) {
      console.log('No push tokens found for users:', userIdArray);
      return { success: false, error: 'No push tokens registered for users' };
    }

    const playerIds = tokens.map((t) => t.playerId);

    // Build notification payload
    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: playerIds,
      headings: { en: options.title },
      contents: { en: options.message },
    };

    // Add optional fields
    if (options.data) {
      payload.data = options.data;
    }
    if (options.url) {
      payload.url = options.url;
    }
    if (options.imageUrl) {
      payload.big_picture = options.imageUrl; // Android
      payload.ios_attachments = { image: options.imageUrl }; // iOS
    }

    // Send to OneSignal
    const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result: OneSignalResponse = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', result);
      return { success: false, error: result.errors?.[0] || 'Failed to send notification' };
    }

    console.log('Push notification sent:', result);
    return {
      success: true,
      data: {
        id: result.id,
        recipients: result.recipients,
      },
    };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message || 'Failed to send push notification' };
  }
};

/**
 * Send push notification to all users (broadcast)
 */
export const sendBroadcastNotification = async (
  options: SendNotificationOptions,
  segment: string = 'All'
): Promise<ServiceResult> => {
  try {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.warn('OneSignal not configured, skipping push notification');
      return { success: false, error: 'OneSignal not configured' };
    }

    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: [segment],
      headings: { en: options.title },
      contents: { en: options.message },
    };

    if (options.data) {
      payload.data = options.data;
    }
    if (options.url) {
      payload.url = options.url;
    }
    if (options.imageUrl) {
      payload.big_picture = options.imageUrl;
      payload.ios_attachments = { image: options.imageUrl };
    }

    const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result: OneSignalResponse = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', result);
      return { success: false, error: result.errors?.[0] || 'Failed to send notification' };
    }

    return {
      success: true,
      data: {
        id: result.id,
        recipients: result.recipients,
      },
    };
  } catch (error: any) {
    console.error('Error sending broadcast notification:', error);
    return { success: false, error: error.message || 'Failed to send broadcast notification' };
  }
};

// ==================== Notification Helpers ====================

/**
 * Send order status notification
 */
export const sendOrderStatusNotification = async (
  userId: string,
  orderNumber: string,
  status: string
): Promise<ServiceResult> => {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed!',
    PROCESSING: 'Your order is being processed.',
    SHIPPED: 'Your order has been shipped!',
    OUT_FOR_DELIVERY: 'Your order is out for delivery!',
    DELIVERED: 'Your order has been delivered!',
    CANCELLED: 'Your order has been cancelled.',
  };

  const message = statusMessages[status] || `Order status updated to ${status}`;

  return sendPushNotification(userId, {
    title: `Order #${orderNumber}`,
    message,
    data: {
      type: 'ORDER_STATUS',
      orderNumber,
      status,
    },
  });
};

/**
 * Send batch recall notification
 */
export const sendBatchRecallNotification = async (
  userId: string,
  medicineName: string,
  batchNumber: string
): Promise<ServiceResult> => {
  return sendPushNotification(userId, {
    title: '⚠️ Medicine Recall Alert',
    message: `${medicineName} (Batch: ${batchNumber}) has been recalled. Please check your orders.`,
    data: {
      type: 'BATCH_RECALL',
      medicineName,
      batchNumber,
    },
  });
};

/**
 * Send payment notification
 */
export const sendPaymentNotification = async (
  userId: string,
  orderNumber: string,
  status: 'success' | 'failed'
): Promise<ServiceResult> => {
  const isSuccess = status === 'success';

  return sendPushNotification(userId, {
    title: isSuccess ? 'Payment Successful ✓' : 'Payment Failed',
    message: isSuccess
      ? `Payment for order #${orderNumber} was successful.`
      : `Payment for order #${orderNumber} failed. Please try again.`,
    data: {
      type: 'PAYMENT_STATUS',
      orderNumber,
      status,
    },
  });
};

/**
 * Send promotional notification to all users
 */
export const sendPromoNotification = async (
  title: string,
  message: string,
  promoCode?: string
): Promise<ServiceResult> => {
  return sendBroadcastNotification({
    title,
    message,
    data: {
      type: 'PROMOTION',
      promoCode,
    },
  });
};
