import { WebSocketClient } from './client';

// WebSocket client instance
let wsClient: WebSocketClient | null = null;

/**
 * Initialize WebSocket connection to central server
 */
export const initWebSocket = async (): Promise<WebSocketClient> => {
  const wsUrl = process.env.WEBSOCKET_URL || 'ws://localhost:3003';
  const serviceKey = process.env.USER_BE_SERVICE_KEY || 'user-be-service-secret-key-2026';

  wsClient = new WebSocketClient({
    url: wsUrl,
    serviceKey,
    serviceType: 'user-be',
    reconnectInterval: 5000,
    maxReconnectAttempts: 20,
  });

  // Register event handlers
  wsClient.on('BATCH_RECALLED', (message) => {
    console.log('[WS] Batch recalled:', message.payload);
    // TODO: Notify users who have this batch in cart
  });

  wsClient.on('NOTIFICATION', (message) => {
    console.log('[WS] Notification received:', message.payload);
    // TODO: Forward to specific users
  });

  wsClient.on('AUTH_SUCCESS', (message) => {
    console.log('[WS] Connected to WebSocket server');
    // Subscribe to relevant channels
    wsClient?.subscribe(['service:user-be', 'service:all']);
  });

  try {
    await wsClient.connect();
    console.log('[WS] WebSocket client initialized');
  } catch (error) {
    console.error('[WS] Failed to connect:', error);
    // Will auto-reconnect
  }

  return wsClient;
};

/**
 * Get WebSocket client instance
 */
export const getWSClient = (): WebSocketClient | null => {
  return wsClient;
};

/**
 * Emit order created event
 */
export const emitOrderCreated = (order: {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
}): void => {
  wsClient?.emitOrderEvent('ORDER_CREATED', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
  });
};

/**
 * Emit order status changed event
 */
export const emitOrderStatusChanged = (order: {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  previousStatus: string;
}): void => {
  wsClient?.emitOrderEvent('ORDER_STATUS_CHANGED', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    previousStatus: order.previousStatus,
  });
};

/**
 * Emit order payment update event
 */
export const emitOrderPaymentUpdate = (order: {
  id: string;
  orderNumber: string;
  userId: string;
  paymentStatus: string;
}): void => {
  wsClient?.emitOrderEvent('ORDER_PAYMENT_UPDATE', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    paymentStatus: order.paymentStatus,
  });
};

export { WebSocketClient };
