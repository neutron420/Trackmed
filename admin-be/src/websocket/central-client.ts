import WebSocket from 'ws';

export interface WSClientConfig {
  url: string;
  serviceKey: string;
  serviceType: 'admin-be' | 'user-be';
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WSMessage {
  type: string;
  payload?: any;
  timestamp?: string;
  messageId?: string;
}

type MessageHandler = (message: WSMessage) => void;

/**
 * WebSocket Client for connecting to the central WebSocket server
 * Used for inter-backend communication (admin-be <-> user-be)
 */
export class CentralWSClient {
  private ws: WebSocket | null = null;
  private config: WSClientConfig;
  private reconnectAttempts = 0;
  private isConnected = false;
  private isAuthenticated = false;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WSClientConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  /**
   * Connect to central WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[Central WS] Connecting to ${this.config.url}...`);
        
        this.ws = new WebSocket(this.config.url);

        this.ws.on('open', () => {
          console.log('[Central WS] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        });

        this.ws.on('message', (data: any) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('close', () => {
          console.log('[Central WS] Connection closed');
          this.isConnected = false;
          this.isAuthenticated = false;
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('[Central WS] Error:', error.message);
          if (!this.isConnected) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Authenticate with server
   */
  private authenticate(): void {
    this.send({
      type: 'AUTH',
      payload: {
        serviceKey: this.config.serviceKey,
        clientType: 'service',
        serviceType: this.config.serviceType,
      },
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const message: WSMessage = JSON.parse(data);
      
      // Handle auth response
      if (message.type === 'AUTH_SUCCESS') {
        this.isAuthenticated = true;
        console.log(`[Central WS] Authenticated as ${this.config.serviceType}`);
      }
      
      if (message.type === 'AUTH_ERROR') {
        console.error('[Central WS] Auth failed:', message.payload?.error);
      }
      
      // Call registered handlers
      const handlers = this.handlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message));
      }
      
      // Call wildcard handlers
      const wildcardHandlers = this.handlers.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => handler(message));
      }
    } catch (error) {
      console.error('[Central WS] Error parsing message:', error);
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('[Central WS] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[Central WS] Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {});
    }, this.config.reconnectInterval);
  }

  /**
   * Send message to server
   */
  send(message: WSMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[Central WS] Not connected');
      return false;
    }
    
    this.ws.send(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    }));
    return true;
  }

  /**
   * Subscribe to channels
   */
  subscribe(channels: string[]): void {
    this.send({
      type: 'SUBSCRIBE',
      payload: { channels },
    });
  }

  /**
   * Emit batch event
   */
  emitBatchEvent(
    type: 'BATCH_CREATED' | 'BATCH_STATUS_CHANGED' | 'BATCH_RECALLED',
    payload: {
      batchId: string;
      batchNumber: string;
      medicineId: string;
      medicineName: string;
      status: string;
      previousStatus?: string;
    }
  ): void {
    this.send({ type, payload });
  }

  /**
   * Emit fraud alert
   */
  emitFraudAlert(payload: {
    alertId: string;
    alertType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    batchId?: string;
    qrCodeId?: string;
    description: string;
  }): void {
    this.send({ type: 'FRAUD_ALERT', payload });
  }

  /**
   * Send notification
   */
  sendNotification(payload: {
    title: string;
    body: string;
    data?: any;
    targetUsers?: string[];
    targetRoles?: string[];
  }): void {
    this.send({ type: 'NOTIFICATION', payload });
  }

  /**
   * Broadcast to all clients
   */
  broadcast(payload: any): void {
    this.send({ type: 'BROADCAST', payload });
  }

  /**
   * Register message handler
   */
  on(messageType: string, handler: MessageHandler): void {
    if (!this.handlers.has(messageType)) {
      this.handlers.set(messageType, []);
    }
    this.handlers.get(messageType)!.push(handler);
  }

  /**
   * Remove message handler
   */
  off(messageType: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if authenticated
   */
  get authenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
  }
}

// Singleton instance
let centralWSClient: CentralWSClient | null = null;

/**
 * Initialize connection to central WebSocket server
 */
export const initCentralWebSocket = async (): Promise<CentralWSClient> => {
  const wsUrl = process.env.WEBSOCKET_URL || 'ws://localhost:3003';
  const serviceKey = process.env.ADMIN_BE_SERVICE_KEY || 'admin-be-service-secret-key-2026';

  centralWSClient = new CentralWSClient({
    url: wsUrl,
    serviceKey,
    serviceType: 'admin-be',
    reconnectInterval: 5000,
    maxReconnectAttempts: 20,
  });

  // Register event handlers
  centralWSClient.on('ORDER_CREATED', (message) => {
    console.log('[Central WS] New order from user-be:', message.payload);
    // Handle new order notification
  });

  centralWSClient.on('ORDER_STATUS_CHANGED', (message) => {
    console.log('[Central WS] Order status changed:', message.payload);
  });

  centralWSClient.on('AUTH_SUCCESS', (message) => {
    console.log('[Central WS] Connected to central WebSocket server');
    centralWSClient?.subscribe(['service:admin-be', 'service:all']);
  });

  try {
    await centralWSClient.connect();
    console.log('[Central WS] WebSocket client initialized');
  } catch (error) {
    console.error('[Central WS] Failed to connect:', error);
    // Will auto-reconnect
  }

  return centralWSClient;
};

/**
 * Get central WebSocket client instance
 */
export const getCentralWSClient = (): CentralWSClient | null => {
  return centralWSClient;
};
