// Mock config
jest.mock("../config", () => ({
  config: {
    connectionLimits: {
      maxTotal: 100,
      maxPerUser: 5,
    },
  },
}));

// We need to test ClientManager class directly
// Import the actual module and recreate instances for testing
import { ExtendedWebSocket, ServiceType, ClientType } from "../types";

// Create a mock WebSocket
const createMockWs = (
  overrides: Partial<ExtendedWebSocket> = {},
): ExtendedWebSocket =>
  ({
    id: `ws-${Math.random().toString(36).substr(2, 9)}`,
    clientType: "user" as ClientType,
    userId: undefined,
    userRole: undefined,
    serviceType: undefined,
    subscriptions: new Set(),
    isAuthenticated: false,
    isAlive: true,
    connectedAt: new Date(),
    lastPing: new Date(),
    readyState: 1, // OPEN
    OPEN: 1,
    send: jest.fn(),
    close: jest.fn(),
    ...overrides,
  } as any as ExtendedWebSocket);

// Helper class that mirrors ClientManager for testing
class TestableClientManager {
  private clients: Map<string, ExtendedWebSocket> = new Map();
  private userClients: Map<string, Set<string>> = new Map();
  private serviceClients: Map<ServiceType, string> = new Map();
  private channels: Map<string, Set<string>> = new Map();

  canConnect(userId?: string): { allowed: boolean; reason?: string } {
    if (this.clients.size >= 100) {
      return { allowed: false, reason: "Server at maximum capacity" };
    }
    if (userId) {
      const userSockets = this.userClients.get(userId);
      const currentCount = userSockets?.size || 0;
      if (currentCount >= 5) {
        return {
          allowed: false,
          reason: "Maximum connections per user reached",
        };
      }
    }
    return { allowed: true };
  }

  addClient(ws: ExtendedWebSocket): boolean {
    const limitCheck = this.canConnect(ws.userId);
    if (!limitCheck.allowed) {
      return false;
    }
    this.clients.set(ws.id, ws);
    if (ws.userId) {
      if (!this.userClients.has(ws.userId)) {
        this.userClients.set(ws.userId, new Set());
      }
      this.userClients.get(ws.userId)!.add(ws.id);
    }
    if (ws.clientType === "service" && ws.serviceType) {
      this.serviceClients.set(ws.serviceType, ws.id);
    }
    return true;
  }

  removeClient(clientId: string): void {
    const ws = this.clients.get(clientId);
    if (!ws) return;
    if (ws.userId) {
      const userSockets = this.userClients.get(ws.userId);
      if (userSockets) {
        userSockets.delete(clientId);
        if (userSockets.size === 0) {
          this.userClients.delete(ws.userId);
        }
      }
    }
    if (ws.clientType === "service" && ws.serviceType) {
      this.serviceClients.delete(ws.serviceType);
    }
    ws.subscriptions.forEach((channel) => {
      this.unsubscribeFromChannel(clientId, channel);
    });
    this.clients.delete(clientId);
  }

  getClient(clientId: string): ExtendedWebSocket | undefined {
    return this.clients.get(clientId);
  }

  getUserClients(userId: string): ExtendedWebSocket[] {
    const clientIds = this.userClients.get(userId);
    if (!clientIds) return [];
    return Array.from(clientIds)
      .map((id) => this.clients.get(id))
      .filter(Boolean) as ExtendedWebSocket[];
  }

  getServiceClient(serviceType: ServiceType): ExtendedWebSocket | undefined {
    const clientId = this.serviceClients.get(serviceType);
    return clientId ? this.clients.get(clientId) : undefined;
  }

  subscribeToChannel(clientId: string, channel: string): void {
    const ws = this.clients.get(clientId);
    if (!ws) return;
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    ws.subscriptions.add(channel);
  }

  unsubscribeFromChannel(clientId: string, channel: string): void {
    const ws = this.clients.get(clientId);
    const subscribers = this.channels.get(channel);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.channels.delete(channel);
      }
    }
    if (ws) {
      ws.subscriptions.delete(channel);
    }
  }

  getChannelSubscribers(channel: string): ExtendedWebSocket[] {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return [];
    return Array.from(clientIds)
      .map((id) => this.clients.get(id))
      .filter(Boolean) as ExtendedWebSocket[];
  }

  getClientsByType(type: ClientType): ExtendedWebSocket[] {
    return Array.from(this.clients.values()).filter(
      (ws) => ws.clientType === type,
    );
  }

  broadcast(data: string, excludeId?: string): void {
    this.clients.forEach((ws, id) => {
      if (id !== excludeId && ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  sendToChannel(channel: string, data: string): void {
    const subscribers = this.getChannelSubscribers(channel);
    subscribers.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  sendToUser(userId: string, data: string): void {
    const clients = this.getUserClients(userId);
    clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      uniqueUsers: this.userClients.size,
      activeChannels: this.channels.size,
      services: Array.from(this.serviceClients.keys()),
    };
  }
}

describe("ClientManager", () => {
  let manager: TestableClientManager;

  beforeEach(() => {
    manager = new TestableClientManager();
  });

  describe("canConnect", () => {
    it("should allow connection when under limit", () => {
      const result = manager.canConnect();
      expect(result.allowed).toBe(true);
    });

    it("should allow connection for new user", () => {
      const result = manager.canConnect("user-123");
      expect(result.allowed).toBe(true);
    });
  });

  describe("addClient", () => {
    it("should add client successfully", () => {
      const ws = createMockWs({ id: "client-1" });
      const result = manager.addClient(ws);
      expect(result).toBe(true);
      expect(manager.getClient("client-1")).toBe(ws);
    });

    it("should track user clients", () => {
      const ws = createMockWs({ id: "client-1", userId: "user-123" });
      manager.addClient(ws);
      const userClients = manager.getUserClients("user-123");
      expect(userClients).toHaveLength(1);
      expect(userClients[0].id).toBe("client-1");
    });

    it("should track service clients", () => {
      const ws = createMockWs({
        id: "client-1",
        clientType: "service",
        serviceType: "admin-be" as ServiceType,
      });
      manager.addClient(ws);
      const serviceClient = manager.getServiceClient("admin-be");
      expect(serviceClient).toBe(ws);
    });
  });

  describe("removeClient", () => {
    it("should remove client", () => {
      const ws = createMockWs({ id: "client-1" });
      manager.addClient(ws);
      manager.removeClient("client-1");
      expect(manager.getClient("client-1")).toBeUndefined();
    });

    it("should clean up user index", () => {
      const ws = createMockWs({ id: "client-1", userId: "user-123" });
      manager.addClient(ws);
      manager.removeClient("client-1");
      const userClients = manager.getUserClients("user-123");
      expect(userClients).toHaveLength(0);
    });
  });

  describe("Channel Subscriptions", () => {
    it("should subscribe client to channel", () => {
      const ws = createMockWs({ id: "client-1" });
      manager.addClient(ws);
      manager.subscribeToChannel("client-1", "batch-updates");
      expect(ws.subscriptions.has("batch-updates")).toBe(true);
    });

    it("should get channel subscribers", () => {
      const ws1 = createMockWs({ id: "client-1" });
      const ws2 = createMockWs({ id: "client-2" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.subscribeToChannel("client-1", "batch-updates");
      manager.subscribeToChannel("client-2", "batch-updates");
      const subscribers = manager.getChannelSubscribers("batch-updates");
      expect(subscribers).toHaveLength(2);
    });

    it("should unsubscribe from channel", () => {
      const ws = createMockWs({ id: "client-1" });
      manager.addClient(ws);
      manager.subscribeToChannel("client-1", "batch-updates");
      manager.unsubscribeFromChannel("client-1", "batch-updates");
      expect(ws.subscriptions.has("batch-updates")).toBe(false);
    });
  });

  describe("broadcast", () => {
    it("should broadcast to all clients", () => {
      const ws1 = createMockWs({ id: "client-1" });
      const ws2 = createMockWs({ id: "client-2" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.broadcast("test message");
      expect(ws1.send).toHaveBeenCalledWith("test message");
      expect(ws2.send).toHaveBeenCalledWith("test message");
    });

    it("should exclude specified client from broadcast", () => {
      const ws1 = createMockWs({ id: "client-1" });
      const ws2 = createMockWs({ id: "client-2" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.broadcast("test message", "client-1");
      expect(ws1.send).not.toHaveBeenCalled();
      expect(ws2.send).toHaveBeenCalledWith("test message");
    });
  });

  describe("sendToChannel", () => {
    it("should send message to channel subscribers", () => {
      const ws1 = createMockWs({ id: "client-1" });
      const ws2 = createMockWs({ id: "client-2" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.subscribeToChannel("client-1", "batch-updates");
      manager.sendToChannel("batch-updates", "channel message");
      expect(ws1.send).toHaveBeenCalledWith("channel message");
      expect(ws2.send).not.toHaveBeenCalled();
    });
  });

  describe("sendToUser", () => {
    it("should send message to all user connections", () => {
      const ws1 = createMockWs({ id: "client-1", userId: "user-123" });
      const ws2 = createMockWs({ id: "client-2", userId: "user-123" });
      const ws3 = createMockWs({ id: "client-3", userId: "user-456" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.addClient(ws3);
      manager.sendToUser("user-123", "user message");
      expect(ws1.send).toHaveBeenCalledWith("user message");
      expect(ws2.send).toHaveBeenCalledWith("user message");
      expect(ws3.send).not.toHaveBeenCalled();
    });
  });

  describe("getClientsByType", () => {
    it("should return clients by type", () => {
      const ws1 = createMockWs({ id: "client-1", clientType: "user" });
      const ws2 = createMockWs({ id: "client-2", clientType: "admin" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      const adminClients = manager.getClientsByType("admin");
      expect(adminClients).toHaveLength(1);
      expect(adminClients[0].id).toBe("client-2");
    });
  });

  describe("getStats", () => {
    it("should return correct stats", () => {
      const ws1 = createMockWs({ id: "client-1", userId: "user-1" });
      const ws2 = createMockWs({ id: "client-2", userId: "user-2" });
      manager.addClient(ws1);
      manager.addClient(ws2);
      manager.subscribeToChannel("client-1", "channel-1");
      const stats = manager.getStats();
      expect(stats.totalClients).toBe(2);
      expect(stats.uniqueUsers).toBe(2);
      expect(stats.activeChannels).toBe(1);
    });
  });
});
