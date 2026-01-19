import { getWebSocketServer } from '../websocket/server';
import { clientManager } from '../websocket/client-manager';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';

export type NotificationType = 
  | 'FRAUD_ALERT'
  | 'BATCH_RECALL'
  | 'BATCH_CREATED'
  | 'BATCH_STATUS_CHANGED'
  | 'EXPIRY_WARNING'
  | 'LIFECYCLE_CHANGE'
  | 'LOW_STOCK'
  | 'STATUS_CHANGE'
  | 'MANUFACTURER_OPERATION'
  | 'ADMIN_ACTION'
  | 'MANUFACTURER_VERIFIED'
  | 'MANUFACTURER_UPDATED'
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
 * Send notification via WebSocket and store in database
 */
export async function sendNotification(notification: Notification) {
  try {
    // Step 1: Store notification in database
    let dbNotification;
    try {
      dbNotification = await prisma.notification.create({
        data: {
          type: notification.type,
          batchId: notification.batchId,
          message: notification.message,
          severity: notification.severity,
          metadata: notification.metadata || {},
          targetRoles: notification.targetRoles || [],
          targetUserIds: notification.targetUserIds || [],
        },
      });
    } catch (dbError) {
      console.error('Failed to store notification in database:', dbError);
      // Continue to send via WebSocket even if DB fails
    }

    // Step 2: Send via WebSocket to connected clients
    const wss = getWebSocketServer();
    if (!wss) {
      console.log('WebSocket server not initialized, notification not sent via WS');
      return;
    }

    const clients = clientManager.getAllClients();
    const notificationMessage = JSON.stringify({
      type: 'NOTIFICATION',
      payload: {
        ...notification,
        id: dbNotification?.id,
        createdAt: dbNotification?.createdAt,
      },
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

/**
 * Send batch status changed notification (for admins to track manufacturer actions)
 */
export async function sendBatchStatusChanged(
  batchId: string,
  batchNumber: string,
  oldStatus: string,
  newStatus: string,
  manufacturerName?: string
) {
  const severity = newStatus === 'RECALLED' ? 'CRITICAL' : 'INFO';
  await sendNotification({
    type: 'BATCH_STATUS_CHANGED',
    batchId,
    message: `Manufacturer ${manufacturerName || 'Unknown'} changed batch ${batchNumber} status from ${oldStatus} to ${newStatus}`,
    severity,
    targetRoles: ['ADMIN', 'SUPERADMIN'],
    metadata: {
      batchNumber,
      oldStatus,
      newStatus,
      manufacturerName,
    },
  });
}

/**
 * Send manufacturer operation notification (general purpose)
 */
export async function sendManufacturerOperation(
  operation: string,
  details: string,
  batchId?: string,
  batchNumber?: string,
  manufacturerName?: string,
  severity: NotificationSeverity = 'INFO'
) {
  await sendNotification({
    type: 'MANUFACTURER_OPERATION',
    batchId,
    message: `Manufacturer ${manufacturerName || 'Unknown'} performed: ${operation} - ${details}`,
    severity,
    targetRoles: ['ADMIN', 'SUPERADMIN'],
    metadata: {
      operation,
      details,
      batchNumber,
      manufacturerName,
    },
  });
}

/**
 * Send notification when admin verifies/unverifies a manufacturer
 */
export async function sendManufacturerVerification(
  manufacturerId: string,
  manufacturerName: string,
  isVerified: boolean,
  adminName?: string
) {
  await sendNotification({
    type: 'MANUFACTURER_VERIFIED',
    message: `Admin ${adminName || 'System'} ${isVerified ? 'verified' : 'unverified'} your manufacturer account: ${manufacturerName}`,
    severity: isVerified ? 'INFO' : 'WARNING',
    targetUserIds: [manufacturerId], // Send to specific manufacturer user
    metadata: {
      manufacturerId,
      manufacturerName,
      isVerified,
      adminName,
    },
  });
}

/**
 * Send notification when admin updates manufacturer details
 */
export async function sendManufacturerUpdate(
  manufacturerId: string,
  manufacturerName: string,
  updateDetails: string,
  adminName?: string
) {
  await sendNotification({
    type: 'MANUFACTURER_UPDATED',
    message: `Admin ${adminName || 'System'} updated your manufacturer account: ${updateDetails}`,
    severity: 'INFO',
    targetUserIds: [manufacturerId], // Send to specific manufacturer user
    metadata: {
      manufacturerId,
      manufacturerName,
      updateDetails,
      adminName,
    },
  });
}

/**
 * Send notification when admin performs an action affecting a manufacturer's batch
 */
export async function sendAdminAction(
  action: string,
  details: string,
  batchId?: string,
  batchNumber?: string,
  manufacturerId?: string,
  adminName?: string,
  severity: NotificationSeverity = 'INFO'
) {
  const notification: Notification = {
    type: 'ADMIN_ACTION',
    batchId,
    message: `Admin ${adminName || 'System'} performed: ${action} - ${details}`,
    severity,
    targetRoles: ['ADMIN', 'SUPERADMIN'],
    metadata: {
      action,
      details,
      batchNumber,
      adminName,
    },
  };

  // If manufacturerId is provided, also notify that specific manufacturer
  if (manufacturerId) {
    notification.targetUserIds = [manufacturerId];
  }

  await sendNotification(notification);
}
