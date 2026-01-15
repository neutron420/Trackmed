import WebSocket from 'ws';

// Client types
export type ClientType = 'user' | 'admin' | 'service';
export type ServiceType = 'admin-be' | 'user-be';

// Extended WebSocket with client info
export interface ExtendedWebSocket extends WebSocket {
  id: string;
  clientType: ClientType;
  userId?: string;
  userRole?: string;
  serviceType?: ServiceType;
  isAlive: boolean;
  subscriptions: Set<string>;
}

// Message types
export type MessageType =
  | 'AUTH'
  | 'AUTH_SUCCESS'
  | 'AUTH_ERROR'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'PING'
  | 'PONG'
  | 'CONNECTED'
  | 'SERVER_SHUTDOWN'
  | 'RATE_LIMIT_ERROR'
  // Order events
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_PAYMENT_UPDATE'
  // Batch events
  | 'BATCH_CREATED'
  | 'BATCH_STATUS_CHANGED'
  | 'BATCH_RECALLED'
  // Scan events
  | 'SCAN_LOGGED'
  | 'FRAUD_ALERT'
  // Inventory events
  | 'INVENTORY_LOW'
  | 'INVENTORY_UPDATED'
  // Notification
  | 'NOTIFICATION'
  | 'BROADCAST';

// Base message structure
export interface WSMessage {
  type: MessageType;
  payload?: any;
  timestamp?: string;
  messageId?: string;
}

// Auth message
export interface AuthMessage extends WSMessage {
  type: 'AUTH';
  payload: {
    token?: string;           // JWT for user/admin
    serviceKey?: string;      // Service key for backend
    clientType: ClientType;
    serviceType?: ServiceType;
  };
}

// Subscribe message
export interface SubscribeMessage extends WSMessage {
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE';
  payload: {
    channels: string[];  // e.g., ['orders:user123', 'batches:all', 'notifications:user123']
  };
}

// Order event
export interface OrderEventMessage extends WSMessage {
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_PAYMENT_UPDATE';
  payload: {
    orderId: string;
    orderNumber: string;
    userId: string;
    status?: string;
    paymentStatus?: string;
    previousStatus?: string;
    updatedAt: string;
  };
}

// Batch event
export interface BatchEventMessage extends WSMessage {
  type: 'BATCH_CREATED' | 'BATCH_STATUS_CHANGED' | 'BATCH_RECALLED';
  payload: {
    batchId: string;
    batchNumber: string;
    medicineId: string;
    medicineName: string;
    status: string;
    previousStatus?: string;
  };
}

// Fraud alert
export interface FraudAlertMessage extends WSMessage {
  type: 'FRAUD_ALERT';
  payload: {
    alertId: string;
    alertType: string;
    severity: string;
    batchId?: string;
    qrCodeId?: string;
    description: string;
  };
}

// Notification
export interface NotificationMessage extends WSMessage {
  type: 'NOTIFICATION';
  payload: {
    title: string;
    body: string;
    data?: any;
    targetUsers?: string[];  // specific user IDs or 'all'
    targetRoles?: string[];  // specific roles
  };
}
