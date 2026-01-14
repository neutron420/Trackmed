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

export class WebSocketClient {
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
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WS Client] Connecting to ${this.config.url}...`);
        
        this.ws = new WebSocket(this.config.url);

        this.ws.on('open', () => {
          console.log('[WS Client] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('close', () => {
          console.log('[WS Client] Connection closed');
          this.isConnected = false;
          this.isAuthenticated = false;
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('[WS Client] Error:', error.message);
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
        console.log(`[WS Client] Authenticated as ${this.config.serviceType}`);
      }
      
      if (message.type === 'AUTH_ERROR') {
        console.error('[WS Client] Auth failed:', message.payload?.error);
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
      console.error('[WS Client] Error parsing message:', error);
    }
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('[WS Client] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS Client] Reconnecting in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {});
    }, this.config.reconnectInterval);
  }

  /**
   * Send message to server
   */
  send(message: WSMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WS Client] Not connected');
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
   * Emit order event
   */
  emitOrderEvent(
    type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_PAYMENT_UPDATE',
    payload: {
      orderId: string;
      orderNumber: string;
      userId: string;
      status?: string;
      paymentStatus?: string;
      previousStatus?: string;
    }
  ): void {
    this.send({
      type,
      payload: {
        ...payload,
        updatedAt: new Date().toISOString(),
      },
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
