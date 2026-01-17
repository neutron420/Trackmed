import { ExtendedWebSocket, ClientType, ServiceType } from './types';
import { config } from './config';

interface ConnectionLimitResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxAllowed?: number;
}

class ClientManager {
  // All connected clients
  private clients: Map<string, ExtendedWebSocket> = new Map();
  
  // Index by user ID for quick lookup
  private userClients: Map<string, Set<string>> = new Map();
  
  // Service clients (admin-be, user-be)
  private serviceClients: Map<ServiceType, string> = new Map();
  
  // Channel subscriptions
  private channels: Map<string, Set<string>> = new Map();

  /**
   * Check if a new connection is allowed based on limits
   */
  canConnect(userId?: string): ConnectionLimitResult {
    // Check total connection limit
    if (this.clients.size >= config.connectionLimits.maxTotal) {
      return {
        allowed: false,
        reason: 'Server at maximum capacity',
        currentCount: this.clients.size,
        maxAllowed: config.connectionLimits.maxTotal,
      };
    }

    // Check per-user connection limit
    if (userId) {
      const userSockets = this.userClients.get(userId);
      const currentCount = userSockets?.size || 0;
      
      if (currentCount >= config.connectionLimits.maxPerUser) {
        return {
          allowed: false,
          reason: 'Maximum connections per user reached',
          currentCount,
          maxAllowed: config.connectionLimits.maxPerUser,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Add a new client
   */
  addClient(ws: ExtendedWebSocket): boolean {
    // Check connection limits before adding
    const limitCheck = this.canConnect(ws.userId);
    if (!limitCheck.allowed) {
      console.log(`[ClientManager] Connection denied for ${ws.id}: ${limitCheck.reason}`);
      return false;
    }

    this.clients.set(ws.id, ws);
    
    // Index by user ID
    if (ws.userId) {
      if (!this.userClients.has(ws.userId)) {
        this.userClients.set(ws.userId, new Set());
      }
      this.userClients.get(ws.userId)!.add(ws.id);
    }
    
    // Track service clients
    if (ws.clientType === 'service' && ws.serviceType) {
      this.serviceClients.set(ws.serviceType, ws.id);
    }
    
    console.log(`[ClientManager] Client added: ${ws.id} (${ws.clientType})`);
    this.logStats();
    return true;
  }

  /**
   * Remove a client
   */
  removeClient(clientId: string): void {
    const ws = this.clients.get(clientId);
    if (!ws) return;
    
    // Remove from user index
    if (ws.userId) {
      const userSockets = this.userClients.get(ws.userId);
      if (userSockets) {
        userSockets.delete(clientId);
        if (userSockets.size === 0) {
          this.userClients.delete(ws.userId);
        }
      }
    }
    
    // Remove from service clients
    if (ws.clientType === 'service' && ws.serviceType) {
      this.serviceClients.delete(ws.serviceType);
    }
    
    // Remove from all channel subscriptions
    ws.subscriptions.forEach(channel => {
      this.unsubscribeFromChannel(clientId, channel);
    });
    
    this.clients.delete(clientId);
    console.log(`[ClientManager] Client removed: ${clientId}`);
    this.logStats();
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): ExtendedWebSocket | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all clients for a user
   */
  getUserClients(userId: string): ExtendedWebSocket[] {
    const clientIds = this.userClients.get(userId);
    if (!clientIds) return [];
    
    return Array.from(clientIds)
      .map(id => this.clients.get(id))
      .filter(Boolean) as ExtendedWebSocket[];
  }

  /**
   * Get service client
   */
  getServiceClient(serviceType: ServiceType): ExtendedWebSocket | undefined {
    const clientId = this.serviceClients.get(serviceType);
    return clientId ? this.clients.get(clientId) : undefined;
  }

  /**
   * Subscribe client to channel
   */
  subscribeToChannel(clientId: string, channel: string): void {
    const ws = this.clients.get(clientId);
    if (!ws) return;
    
    // Add to channel subscribers
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    
    // Track in client's subscriptions
    ws.subscriptions.add(channel);
    
    console.log(`[ClientManager] ${clientId} subscribed to ${channel}`);
  }

  /**
   * Unsubscribe client from channel
   */
  unsubscribeFromChannel(clientId: string, channel: string): void {
    const ws = this.clients.get(clientId);
    
    // Remove from channel
    const subscribers = this.channels.get(channel);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.channels.delete(channel);
      }
    }
    
    // Remove from client's subscriptions
    if (ws) {
      ws.subscriptions.delete(channel);
    }
  }

  /**
   * Get all subscribers of a channel
   */
  getChannelSubscribers(channel: string): ExtendedWebSocket[] {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return [];
    
    return Array.from(clientIds)
      .map(id => this.clients.get(id))
      .filter(Boolean) as ExtendedWebSocket[];
  }

  /**
   * Get all clients by type
   */
  getClientsByType(type: ClientType): ExtendedWebSocket[] {
    return Array.from(this.clients.values())
      .filter(ws => ws.clientType === type);
  }

  /**
   * Get all clients by role
   */
  getClientsByRole(role: string): ExtendedWebSocket[] {
    return Array.from(this.clients.values())
      .filter(ws => ws.userRole === role);
  }

  /**
   * Broadcast to all clients
   */
  broadcast(data: string, excludeId?: string): void {
    this.clients.forEach((ws, id) => {
      if (id !== excludeId && ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  /**
   * Send to specific channel
   */
  sendToChannel(channel: string, data: string): void {
    const subscribers = this.getChannelSubscribers(channel);
    subscribers.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  /**
   * Send to specific user (all their connections)
   */
  sendToUser(userId: string, data: string): void {
    const clients = this.getUserClients(userId);
    clients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  /**
   * Send to service backend
   */
  sendToService(serviceType: ServiceType, data: string): void {
    const ws = this.getServiceClient(serviceType);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  }

  /**
   * Log connection stats
   */
  private logStats(): void {
    console.log(`[ClientManager] Stats: ${this.clients.size} clients, ${this.userClients.size} users, ${this.channels.size} channels`);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      uniqueUsers: this.userClients.size,
      activeChannels: this.channels.size,
      services: Array.from(this.serviceClients.keys()),
    };
  }
}

export const clientManager = new ClientManager();
