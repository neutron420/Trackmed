import { UserRole } from '@prisma/client';
export type NotificationType = 'FRAUD_ALERT' | 'BATCH_RECALL' | 'EXPIRY_WARNING' | 'LIFECYCLE_CHANGE' | 'LOW_STOCK' | 'STATUS_CHANGE' | 'SYSTEM';
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
export declare function sendNotification(notification: Notification): Promise<void>;
/**
 * Send fraud alert notification
 */
export declare function sendFraudAlert(batchId: string, alertType: string, severity: NotificationSeverity): Promise<void>;
/**
 * Send batch recall notification
 */
export declare function sendBatchRecall(batchId: string, batchNumber: string): Promise<void>;
/**
 * Send expiry warning notification
 */
export declare function sendExpiryWarning(batchId: string, batchNumber: string, daysUntilExpiry: number): Promise<void>;
/**
 * Send low stock notification
 */
export declare function sendLowStockNotification(batchId: string, batchNumber: string, remainingQuantity: number): Promise<void>;
//# sourceMappingURL=notification.service.d.ts.map