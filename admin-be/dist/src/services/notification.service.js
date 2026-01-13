"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.sendFraudAlert = sendFraudAlert;
exports.sendBatchRecall = sendBatchRecall;
exports.sendExpiryWarning = sendExpiryWarning;
exports.sendLowStockNotification = sendLowStockNotification;
const server_1 = require("../websocket/server");
const client_manager_1 = require("../websocket/client-manager");
/**
 * Send notification via WebSocket
 */
async function sendNotification(notification) {
    try {
        const wss = (0, server_1.getWebSocketServer)();
        if (!wss) {
            console.log('WebSocket server not initialized, notification not sent');
            return;
        }
        const clients = client_manager_1.clientManager.getAllClients();
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
                if (notification.targetRoles.includes(client.role) &&
                    client.socket.readyState === 1) {
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
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
}
/**
 * Send fraud alert notification
 */
async function sendFraudAlert(batchId, alertType, severity) {
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
async function sendBatchRecall(batchId, batchNumber) {
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
async function sendExpiryWarning(batchId, batchNumber, daysUntilExpiry) {
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
async function sendLowStockNotification(batchId, batchNumber, remainingQuantity) {
    await sendNotification({
        type: 'LOW_STOCK',
        batchId,
        message: `Batch ${batchNumber} has low stock: ${remainingQuantity} units remaining`,
        severity: 'WARNING',
        targetRoles: ['ADMIN', 'SUPERADMIN', 'MANUFACTURER', 'PHARMACY'],
        metadata: { batchNumber, remainingQuantity },
    });
}
//# sourceMappingURL=notification.service.js.map