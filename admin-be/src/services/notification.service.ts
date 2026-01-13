import { getWebSocketServer } from '../websocket/server';
import { clientManager } from '../websocket/client-manager';
import { UserRole } from '@prisma/client';

export type NotificationType = 
  | 'FRAUD_ALERT'
  | 'BATCH_RECALL'
  | 'EXPIRY_WARNING'
  | 'LIFECYCLE_CHANGE'
  | 'LOW_STOCK'
  | 'STATUS_CHANGE'
  | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface Notification {
  type: NotificationType;
  batchId?: string;
  message: string;
  severity: NotificationSeverity;
  metadata?: any;
  targetRoles?: UserRole[];
  targetUserIds?: string[];
}

/**
 * Send notification via WebSocket
 */
export async function sendNotification(notification: Notification) {
  try {
    const wss = getWebSocketServer();
    if (!wss) {
      console.log('WebSocket server not initialized, notification not sent');
      return;
    }

    const clients = clientManager.getAllClients();
    const notificationMessage = JSON.stringify({
      type: 'NOTIFICATION',
      payload: notification,
    });

    // Send to specific users if specified
    if (notification.targetUserIds && notification.targetUserIds.length > 0) {
      notification.targetUserIds.forEach((userId) => {
        const client = clients.find((c) => c.userId === userId);
        if (client && client.socket.readyState === 1) {
          client.socket.send(notificationMessage);
        }
      });
      return;
    }

    // Send to specific roles if specified
    if (notification.targetRoles && notification.targetRoles.length > 0) {
      clients.forEach((client) => {
        if (
          notification.targetRoles!.includes(client.role) &&
          client.socket.readyState === 1
        ) {
          client.socket.send(notificationMessage);
        }
      });
      return;
    }

    // Send to all connected clients (broadcast)
    clients.forEach((client) => {
      if (client.socket.readyState === 1) {
        client.socket.send(notificationMessage);
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Send fraud alert notification
 */
export async function sendFraudAlert(batchId: string, alertType: string, severity: NotificationSeverity) {
  await sendNotification({
    type: 'FRAUD_ALERT',
    batchId,
    message: `Fraud alert: ${alertType}`,
    severity,
    targetRoles: ['ADMIN', 'SUPERADMIN'],
    metadata: { alertType },
  });
}

/**
 * Send batch recall notification
 */
export async function sendBatchRecall(batchId: string, batchNumber: string) {
  await sendNotification({
    type: 'BATCH_RECALL',
    batchId,
    message: `Batch ${batchNumber} has been recalled`,
    severity: 'CRITICAL',
    metadata: { batchNumber },
  });
}

/**
 * Send expiry warning notification
 */
export async function sendExpiryWarning(batchId: string, batchNumber: string, daysUntilExpiry: number) {
  await sendNotification({
    type: 'EXPIRY_WARNING',
    batchId,
    message: `Batch ${batchNumber} will expire in ${daysUntilExpiry} days`,
    severity: daysUntilExpiry <= 7 ? 'ERROR' : 'WARNING',
    targetRoles: ['ADMIN', 'SUPERADMIN', 'MANUFACTURER'],
    metadata: { batchNumber, daysUntilExpiry },
  });
}

/**
 * Send low stock notification
 */
export async function sendLowStockNotification(batchId: string, batchNumber: string, remainingQuantity: number) {
  await sendNotification({
    type: 'LOW_STOCK',
    batchId,
    message: `Batch ${batchNumber} has low stock: ${remainingQuantity} units remaining`,
    severity: 'WARNING',
    targetRoles: ['ADMIN', 'SUPERADMIN', 'MANUFACTURER', 'PHARMACY'],
    metadata: { batchNumber, remainingQuantity },
  });
}
