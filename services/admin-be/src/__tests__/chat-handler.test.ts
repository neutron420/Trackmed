/**
 * Chat Handler Tests
 * Tests for WebSocket chat message handling and persistence
 * Ensures messages are saved to database when sent via WebSocket
 */

// Mock Prisma and chat service
const mockCreate = jest.fn();
const mockFindUnique = jest.fn();

jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    chatMessage: {
      create: mockCreate,
    },
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

const mockSaveChatMessage = jest.fn();
jest.mock("../services/chat.service", () => ({
  saveChatMessage: mockSaveChatMessage,
}));

const mockGetAllClients = jest.fn();
jest.mock("../websocket/client-manager", () => ({
  clientManager: {
    getAllClients: mockGetAllClients,
  },
}));

import {
  handleChatMessage,
  validateChatMessage,
} from "../websocket/chat-handler";

describe("Chat Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveChatMessage.mockResolvedValue({ success: true });
  });

  describe("validateChatMessage", () => {
    it("should return true for valid chat message", () => {
      const message = {
        type: "CHAT",
        payload: {
          message: "Hello world",
          recipientId: "user-456",
        },
      };

      expect(validateChatMessage(message)).toBe(true);
    });

    it("should return true for broadcast message (no recipientId)", () => {
      const message = {
        type: "CHAT",
        payload: {
          message: "Broadcast to all",
        },
      };

      expect(validateChatMessage(message)).toBe(true);
    });

    it("should return false for empty message", () => {
      const message = {
        type: "CHAT",
        payload: {
          message: "",
        },
      };

      expect(validateChatMessage(message)).toBe(false);
    });

    it("should return false for whitespace-only message", () => {
      const message = {
        type: "CHAT",
        payload: {
          message: "   ",
        },
      };

      expect(validateChatMessage(message)).toBe(false);
    });

    it("should return false for message exceeding 1000 characters", () => {
      const message = {
        type: "CHAT",
        payload: {
          message: "a".repeat(1001),
        },
      };

      expect(validateChatMessage(message)).toBe(false);
    });

    it("should return false for wrong message type", () => {
      const message = {
        type: "LOCATION",
        payload: {
          message: "Hello",
        },
      };

      expect(validateChatMessage(message)).toBe(false);
    });

    it("should return false for missing payload", () => {
      const message = {
        type: "CHAT",
      };

      expect(validateChatMessage(message)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(validateChatMessage(null)).toBe(false);
      expect(validateChatMessage(undefined)).toBe(false);
    });
  });

  describe("handleChatMessage", () => {
    const mockAdminUser = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@test.com",
      role: "ADMIN",
    };

    const mockManufacturerUser = {
      id: "mfg-1",
      name: "Manufacturer User",
      email: "mfg@test.com",
      role: "MANUFACTURER",
    };

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(mockAdminUser);
      mockGetAllClients.mockReturnValue([]);
    });

    it("should persist chat message to database", async () => {
      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Test message that should be saved",
          recipientId: "mfg-1",
          timestamp: "2026-01-01T10:00:00Z",
        },
      };

      const result = await handleChatMessage(message, "admin-1", "ADMIN");

      expect(result.success).toBe(true);
      expect(mockSaveChatMessage).toHaveBeenCalledWith({
        senderId: "admin-1",
        senderName: "Admin User",
        senderRole: "ADMIN",
        recipientId: "mfg-1",
        message: "Test message that should be saved",
        timestamp: expect.any(Date),
      });
    });

    it("should persist broadcast message (no recipientId)", async () => {
      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Broadcast to everyone",
        },
      };

      const result = await handleChatMessage(message, "admin-1", "ADMIN");

      expect(result.success).toBe(true);
      expect(mockSaveChatMessage).toHaveBeenCalledWith({
        senderId: "admin-1",
        senderName: "Admin User",
        senderRole: "ADMIN",
        recipientId: undefined,
        message: "Broadcast to everyone",
        timestamp: expect.any(Date),
      });
    });

    it("should reject empty message", async () => {
      const message = {
        type: "CHAT" as const,
        payload: {
          message: "",
        },
      };

      const result = await handleChatMessage(message, "admin-1", "ADMIN");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Message is required and must be a string");
      expect(mockSaveChatMessage).not.toHaveBeenCalled();
    });

    it("should reject message longer than 1000 characters", async () => {
      const message = {
        type: "CHAT" as const,
        payload: {
          message: "a".repeat(1001),
        },
      };

      const result = await handleChatMessage(message, "admin-1", "ADMIN");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Message too long (max 1000 characters)");
      expect(mockSaveChatMessage).not.toHaveBeenCalled();
    });

    it("should reject non-ADMIN/MANUFACTURER users", async () => {
      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Test message",
        },
      };

      const result = await handleChatMessage(message, "user-1", "CONSUMER");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only ADMIN and MANUFACTURER users can chat");
      expect(mockSaveChatMessage).not.toHaveBeenCalled();
    });

    it("should allow MANUFACTURER users to send chat", async () => {
      mockFindUnique.mockResolvedValue(mockManufacturerUser);

      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Message from manufacturer",
          recipientId: "admin-1",
        },
      };

      const result = await handleChatMessage(message, "mfg-1", "MANUFACTURER");

      expect(result.success).toBe(true);
      expect(mockSaveChatMessage).toHaveBeenCalled();
    });

    it("should handle sender not found", async () => {
      mockFindUnique.mockResolvedValue(null);

      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Test message",
        },
      };

      const result = await handleChatMessage(message, "unknown-user", "ADMIN");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Sender not found");
    });

    it("should send message to recipient clients", async () => {
      const mockRecipientSocket = {
        readyState: 1,
        send: jest.fn(),
      };

      mockGetAllClients.mockReturnValue([
        {
          userId: "mfg-1",
          role: "MANUFACTURER",
          socket: mockRecipientSocket,
        },
        {
          userId: "admin-1",
          role: "ADMIN",
          socket: {
            readyState: 1,
            send: jest.fn(),
          },
        },
      ]);

      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Direct message",
          recipientId: "mfg-1",
        },
      };

      await handleChatMessage(message, "admin-1", "ADMIN");

      // Verify message was sent to recipient
      expect(mockRecipientSocket.send).toHaveBeenCalled();
      const sentData = JSON.parse(mockRecipientSocket.send.mock.calls[0][0]);
      expect(sentData.type).toBe("CHAT_RECEIVED");
      expect(sentData.payload.message).toBe("Direct message");
      expect(sentData.payload.senderId).toBe("admin-1");
    });

    it("should save message even when recipient is offline", async () => {
      // No connected clients
      mockGetAllClients.mockReturnValue([]);

      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Message to offline user",
          recipientId: "offline-user",
        },
      };

      const result = await handleChatMessage(message, "admin-1", "ADMIN");

      // Message should still be saved
      expect(result.success).toBe(true);
      expect(mockSaveChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Message to offline user",
          recipientId: "offline-user",
        }),
      );
    });

    it("should broadcast to all ADMIN and MANUFACTURER when no recipientId", async () => {
      const mockAdminSocket = {
        readyState: 1,
        send: jest.fn(),
      };
      const mockMfgSocket = {
        readyState: 1,
        send: jest.fn(),
      };
      const mockConsumerSocket = {
        readyState: 1,
        send: jest.fn(),
      };

      mockGetAllClients.mockReturnValue([
        { userId: "admin-1", role: "ADMIN", socket: mockAdminSocket },
        { userId: "mfg-1", role: "MANUFACTURER", socket: mockMfgSocket },
        { userId: "consumer-1", role: "CONSUMER", socket: mockConsumerSocket },
      ]);

      const message = {
        type: "CHAT" as const,
        payload: {
          message: "Broadcast message",
        },
      };

      await handleChatMessage(message, "admin-1", "ADMIN");

      // ADMIN and MANUFACTURER should receive
      expect(mockAdminSocket.send).toHaveBeenCalled();
      expect(mockMfgSocket.send).toHaveBeenCalled();
      // CONSUMER should NOT receive
      expect(mockConsumerSocket.send).not.toHaveBeenCalled();
    });
  });
});

describe("Chat Message Persistence Flow", () => {
  /**
   * This test suite verifies the complete flow of chat message persistence:
   * 1. WebSocket receives CHAT message
   * 2. handleChatMessage validates and persists via saveChatMessage
   * 3. Message is stored in database (ChatMessage table)
   * 4. On page refresh, getChatHistory retrieves from database
   */

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should persist messages so they survive page refresh", async () => {
    // Setup: User sends a message
    mockFindUnique.mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      email: "admin@test.com",
      role: "ADMIN",
    });
    mockGetAllClients.mockReturnValue([]);
    mockSaveChatMessage.mockResolvedValue({ success: true });

    const message = {
      type: "CHAT" as const,
      payload: {
        message: "This message should persist!",
        recipientId: "mfg-1",
      },
    };

    // 1. Send message via WebSocket handler
    const result = await handleChatMessage(message, "admin-1", "ADMIN");
    expect(result.success).toBe(true);

    // 2. Verify saveChatMessage was called to persist
    expect(mockSaveChatMessage).toHaveBeenCalledTimes(1);
    expect(mockSaveChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        senderId: "admin-1",
        recipientId: "mfg-1",
        message: "This message should persist!",
      }),
    );

    // The actual persistence is handled by saveChatMessage -> prisma.chatMessage.create
    // On refresh, getChatHistory -> prisma.chatMessage.findMany retrieves it
    // This flow is tested in chat.service.test.ts
  });
});
