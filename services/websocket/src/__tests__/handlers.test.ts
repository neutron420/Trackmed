// Mock dependencies
jest.mock("../client-manager", () => ({
  clientManager: {
    addClient: jest.fn(() => true),
    removeClient: jest.fn(),
    subscribeToChannel: jest.fn(),
    unsubscribeFromChannel: jest.fn(),
    getChannelSubscribers: jest.fn(() => []),
    getClientsByRole: jest.fn(() => []),
    sendToChannel: jest.fn(),
    sendToUser: jest.fn(),
    getUserClients: jest.fn(() => []),
  },
}));

jest.mock("../auth", () => ({
  authenticateClient: jest.fn(),
}));

jest.mock("../rate-limiter", () => ({
  rateLimiter: {
    isAllowed: jest.fn(() => true),
    getRemaining: jest.fn(() => 10),
    getResetTime: jest.fn(() => 60000),
  },
}));

jest.mock("../config", () => ({
  config: {
    rateLimit: {
      windowMs: 60000,
      maxMessages: 100,
    },
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

import { clientManager } from "../client-manager";
import { authenticateClient } from "../auth";
import { rateLimiter } from "../rate-limiter";
import { handleMessage } from "../handlers";
import { ExtendedWebSocket } from "../types";

// Create mock WebSocket
const createMockWs = (
  overrides: Partial<ExtendedWebSocket> = {},
): ExtendedWebSocket =>
  ({
    id: "test-client-1",
    clientType: "user",
    userId: undefined,
    userRole: undefined,
    serviceType: undefined,
    subscriptions: new Set(),
    isAuthenticated: false,
    isAlive: true,
    connectedAt: new Date(),
    lastPing: new Date(),
    readyState: 1,
    OPEN: 1,
    send: jest.fn(),
    close: jest.fn(),
    ...overrides,
  } as any as ExtendedWebSocket);

describe("WebSocket Handlers", () => {
  let mockWs: ExtendedWebSocket;

  beforeEach(() => {
    mockWs = createMockWs();
    jest.clearAllMocks();
    (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);
  });

  describe("handleMessage - Error Handling", () => {
    it("should handle invalid JSON gracefully", () => {
      // Suppress console.error for this test as we expect an error log
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      handleMessage(mockWs, "not valid json {{{");

      expect(mockWs.send).toHaveBeenCalled();
      const sentData = JSON.parse((mockWs.send as jest.Mock).mock.calls[0][0]);
      expect(sentData.type).toBe("AUTH_ERROR");

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe("handleMessage - Rate Limiting", () => {
    it("should allow messages within rate limit", () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(true);

      handleMessage(mockWs, JSON.stringify({ type: "PING" }));

      expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining("PONG"));
    });

    it("should block messages exceeding rate limit", () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      handleMessage(
        mockWs,
        JSON.stringify({ type: "SUBSCRIBE", payload: { channels: ["test"] } }),
      );

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("RATE_LIMIT_ERROR"),
      );
    });

    it("should not rate limit AUTH messages", () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);
      (authenticateClient as jest.Mock).mockReturnValue({
        success: true,
        clientType: "user",
        userId: "user-123",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "valid-token" },
        }),
      );

      // Should not have sent rate limit error
      const calls = (mockWs.send as jest.Mock).mock.calls;
      const hasRateLimitError = calls.some((call: any) =>
        call[0].includes("RATE_LIMIT_ERROR"),
      );
      expect(hasRateLimitError).toBe(false);
    });

    it("should not rate limit PING messages", () => {
      (rateLimiter.isAllowed as jest.Mock).mockReturnValue(false);

      handleMessage(mockWs, JSON.stringify({ type: "PING" }));

      // Should respond with PONG, not rate limit error
      expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining("PONG"));
    });
  });

  describe("handleMessage - PING", () => {
    it("should respond with PONG", () => {
      handleMessage(mockWs, JSON.stringify({ type: "PING" }));

      expect(mockWs.send).toHaveBeenCalled();
      const sentData = JSON.parse((mockWs.send as jest.Mock).mock.calls[0][0]);
      expect(sentData.type).toBe("PONG");
    });

    it("should update isAlive flag", () => {
      mockWs.isAlive = false;

      handleMessage(mockWs, JSON.stringify({ type: "PING" }));

      expect(mockWs.isAlive).toBe(true);
    });
  });

  describe("handleMessage - AUTH", () => {
    it("should authenticate with valid token", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: true,
        clientType: "user",
        userId: "user-123",
        userRole: "CONSUMER",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "valid-token" },
        }),
      );

      expect(mockWs.userId).toBe("user-123");
      expect(clientManager.addClient).toHaveBeenCalledWith(mockWs);
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("AUTH_SUCCESS"),
      );
    });

    it("should auto-subscribe user to their channels", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: true,
        clientType: "user",
        userId: "user-123",
        userRole: "CONSUMER",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "valid-token" },
        }),
      );

      expect(clientManager.subscribeToChannel).toHaveBeenCalledWith(
        mockWs.id,
        "user:user-123",
      );
      expect(clientManager.subscribeToChannel).toHaveBeenCalledWith(
        mockWs.id,
        "orders:user-123",
      );
    });

    it("should reject invalid token", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: false,
        error: "Invalid token",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "invalid-token" },
        }),
      );

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("AUTH_ERROR"),
      );
    });

    it("should authenticate service clients", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: true,
        clientType: "service",
        serviceType: "admin-be",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: {
            serviceKey: "valid-key",
            clientType: "service",
            serviceType: "admin-be",
          },
        }),
      );

      expect(mockWs.clientType).toBe("service");
      expect(mockWs.serviceType).toBe("admin-be");
      expect(clientManager.subscribeToChannel).toHaveBeenCalledWith(
        mockWs.id,
        "service:all",
      );
    });

    it("should close connection on failed auth", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: false,
        error: "Invalid credentials",
      });
      (clientManager.addClient as jest.Mock).mockReturnValue(false);

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "invalid" },
        }),
      );

      // Auth failed, error should be sent
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("AUTH_ERROR"),
      );
    });

    it("should authenticate admin users", () => {
      (authenticateClient as jest.Mock).mockReturnValue({
        success: true,
        clientType: "admin",
        userId: "admin-123",
        userRole: "ADMIN",
      });

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "AUTH",
          payload: { token: "admin-token" },
        }),
      );

      // Verify admin properties were set correctly
      expect(mockWs.clientType).toBe("admin");
      expect(mockWs.userId).toBe("admin-123");
      expect(mockWs.userRole).toBe("ADMIN");
      expect(clientManager.addClient).toHaveBeenCalledWith(mockWs);
    });
  });

  describe("handleMessage - SUBSCRIBE", () => {
    beforeEach(() => {
      mockWs.userId = "user-123";
      mockWs.clientType = "user";
    });

    it("should subscribe to valid channel", () => {
      handleMessage(
        mockWs,
        JSON.stringify({
          type: "SUBSCRIBE",
          payload: { channels: ["batch-updates"] },
        }),
      );

      expect(clientManager.subscribeToChannel).toHaveBeenCalledWith(
        mockWs.id,
        "batch-updates",
      );
    });

    it("should return subscription confirmation", () => {
      handleMessage(
        mockWs,
        JSON.stringify({
          type: "SUBSCRIBE",
          payload: { channels: ["channel1", "channel2"] },
        }),
      );

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("SUBSCRIBE"),
      );
    });
  });

  describe("handleMessage - UNSUBSCRIBE", () => {
    beforeEach(() => {
      mockWs.userId = "user-123";
    });

    it("should unsubscribe from channel", () => {
      handleMessage(
        mockWs,
        JSON.stringify({
          type: "UNSUBSCRIBE",
          payload: { channels: ["batch-updates"] },
        }),
      );

      expect(clientManager.unsubscribeFromChannel).toHaveBeenCalledWith(
        mockWs.id,
        "batch-updates",
      );
    });
  });

  describe("handleMessage - Service Events", () => {
    beforeEach(() => {
      mockWs.clientType = "service";
      mockWs.serviceType = "admin-be";
    });

    it("should handle BATCH_CREATED event from service", () => {
      handleMessage(
        mockWs,
        JSON.stringify({
          type: "BATCH_CREATED",
          payload: { batchId: "batch-123" },
        }),
      );

      expect(clientManager.sendToChannel).toHaveBeenCalledWith(
        "admin:all",
        expect.stringContaining("BATCH_CREATED"),
      );
    });

    it("should reject events from non-service clients", () => {
      mockWs.clientType = "user";

      handleMessage(
        mockWs,
        JSON.stringify({
          type: "BATCH_CREATED",
          payload: { batchId: "batch-123" },
        }),
      );

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining("AUTH_ERROR"),
      );
    });
  });
});
