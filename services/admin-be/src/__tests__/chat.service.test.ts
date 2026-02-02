/**
 * Chat Service Tests
 * Tests for chat history persistence and retrieval
 * This ensures messages survive page refresh (like WhatsApp)
 */

// Mock Prisma - must be before imports
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockUserFindMany = jest.fn();

jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    chatMessage: {
      create: mockCreate,
      findMany: mockFindMany,
    },
    user: {
      findMany: mockUserFindMany,
    },
  },
}));

import {
  saveChatMessage,
  getChatHistory,
  getChatUsers,
  getOnlineUsers,
} from "../services/chat.service";

describe("Chat Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveChatMessage", () => {
    it("should successfully save a chat message to database", async () => {
      const messageData = {
        senderId: "user-123",
        senderName: "Test User",
        senderRole: "ADMIN",
        recipientId: "user-456",
        message: "Hello, this is a test message",
        timestamp: new Date(),
      };

      mockCreate.mockResolvedValueOnce({
        id: "msg-1",
        ...messageData,
        createdAt: new Date(),
      });

      const result = await saveChatMessage(messageData);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          senderId: messageData.senderId,
          recipientId: messageData.recipientId,
          message: messageData.message,
        },
      });
    });

    it("should save a broadcast message (no recipientId)", async () => {
      const messageData = {
        senderId: "user-123",
        senderName: "Admin User",
        senderRole: "ADMIN",
        message: "Broadcast message to all",
        timestamp: new Date(),
      };

      mockCreate.mockResolvedValueOnce({
        id: "msg-2",
        ...messageData,
        recipientId: null,
        createdAt: new Date(),
      });

      const result = await saveChatMessage(messageData);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          senderId: messageData.senderId,
          recipientId: null,
          message: messageData.message,
        },
      });
    });

    it("should handle database errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const messageData = {
        senderId: "user-123",
        senderName: "Test User",
        senderRole: "ADMIN",
        message: "Test message",
        timestamp: new Date(),
      };

      mockCreate.mockRejectedValueOnce(new Error("Database connection failed"));

      const result = await saveChatMessage(messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database connection failed");

      consoleSpy.mockRestore();
    });
  });

  describe("getChatHistory", () => {
    const mockSender = {
      id: "user-123",
      name: "Admin User",
      email: "admin@test.com",
      role: "ADMIN",
    };

    const mockRecipient = {
      id: "user-456",
      name: "Manufacturer User",
      email: "mfg@test.com",
      role: "MANUFACTURER",
    };

    it("should retrieve 1:1 conversation history between two users", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          senderId: "user-123",
          recipientId: "user-456",
          message: "Hello from admin",
          createdAt: new Date("2026-01-01T10:00:00Z"),
          sender: mockSender,
        },
        {
          id: "msg-2",
          senderId: "user-456",
          recipientId: "user-123",
          message: "Hi admin!",
          createdAt: new Date("2026-01-01T10:01:00Z"),
          sender: mockRecipient,
        },
        {
          id: "msg-3",
          senderId: "user-123",
          recipientId: "user-456",
          message: "How are you?",
          createdAt: new Date("2026-01-01T10:02:00Z"),
          sender: mockSender,
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockMessages);

      const result = await getChatHistory({
        userId: "user-123",
        recipientId: "user-456",
        limit: 50,
      });

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(3);
      expect(result.messages![0]!.message).toBe("Hello from admin");
      expect(result.messages![1]!.message).toBe("Hi admin!");
      expect(result.messages![2]!.message).toBe("How are you?");

      // Verify the query was for both directions (A->B and B->A)
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { senderId: "user-123", recipientId: "user-456" },
              { senderId: "user-456", recipientId: "user-123" },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 50,
          skip: 0,
        }),
      );
    });

    it("should retrieve all messages for a user (no specific recipient)", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          senderId: "user-123",
          recipientId: null,
          message: "Broadcast message",
          createdAt: new Date("2026-01-01T10:00:00Z"),
          sender: mockSender,
        },
        {
          id: "msg-2",
          senderId: "user-456",
          recipientId: "user-123",
          message: "Direct message to me",
          createdAt: new Date("2026-01-01T10:01:00Z"),
          sender: mockRecipient,
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockMessages);

      const result = await getChatHistory({
        userId: "user-123",
        limit: 50,
      });

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(2);

      // Verify query checks where user is sender OR recipient
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ senderId: "user-123" }, { recipientId: "user-123" }],
          },
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should respect pagination (limit and offset)", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      await getChatHistory({
        userId: "user-123",
        recipientId: "user-456",
        limit: 20,
        offset: 40,
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        }),
      );
    });

    it("should cap limit at 200 messages", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      await getChatHistory({
        userId: "user-123",
        limit: 500, // Trying to get 500
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 200, // Should be capped at 200
        }),
      );
    });

    it("should use default limit of 50 when not specified", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      await getChatHistory({
        userId: "user-123",
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it("should handle database error gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFindMany.mockRejectedValueOnce(new Error("Database error"));

      const result = await getChatHistory({
        userId: "user-123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
      expect(result.messages).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("should return messages with correct structure", async () => {
      const mockMessages = [
        {
          id: "msg-1",
          senderId: "user-123",
          recipientId: "user-456",
          message: "Test message",
          createdAt: new Date("2026-01-01T10:00:00Z"),
          sender: {
            id: "user-123",
            name: "Test User",
            email: "test@test.com",
            role: "ADMIN",
          },
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockMessages);

      const result = await getChatHistory({
        userId: "user-123",
        recipientId: "user-456",
      });

      expect(result.success).toBe(true);
      expect(result.messages![0]).toEqual({
        id: "msg-1",
        message: "Test message",
        senderId: "user-123",
        senderName: "Test User",
        senderRole: "ADMIN",
        recipientId: "user-456",
        timestamp: expect.any(String),
      });
    });
  });

  describe("getChatUsers", () => {
    it("should return list of ADMIN and MANUFACTURER users excluding current user", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: "Admin 1",
          email: "admin1@test.com",
          role: "ADMIN",
          createdAt: new Date(),
        },
        {
          id: "user-2",
          name: "Manufacturer 1",
          email: "mfg1@test.com",
          role: "MANUFACTURER",
          createdAt: new Date(),
        },
      ];

      mockUserFindMany.mockResolvedValueOnce(mockUsers);

      const result = await getChatUsers("current-user-id");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "user-1",
        name: "Admin 1",
        email: "admin1@test.com",
        role: "ADMIN",
        avatar: "A",
      });

      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: { in: ["ADMIN", "MANUFACTURER"] },
            id: { not: "current-user-id" },
          },
        }),
      );
    });

    it("should use email prefix as name if name is null", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: null,
          email: "testuser@test.com",
          role: "ADMIN",
          createdAt: new Date(),
        },
      ];

      mockUserFindMany.mockResolvedValueOnce(mockUsers);

      const result = await getChatUsers("current-user-id");

      expect(result[0]!.name).toBe("testuser");
      expect(result[0]!.avatar).toBe("T");
    });
  });

  describe("getOnlineUsers", () => {
    it("should return list of ADMIN and MANUFACTURER users", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: "Admin 1",
          email: "admin1@test.com",
          role: "ADMIN",
        },
        {
          id: "user-2",
          name: null,
          email: "mfg1@test.com",
          role: "MANUFACTURER",
        },
      ];

      mockUserFindMany.mockResolvedValueOnce(mockUsers);

      const result = await getOnlineUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "user-1",
        name: "Admin 1",
        email: "admin1@test.com",
        role: "ADMIN",
        isOnline: false,
      });
      // Name fallback to email
      expect(result[1]!.name).toBe("mfg1@test.com");
    });
  });
});

describe("Chat History Persistence (Integration-style)", () => {
  /**
   * These tests verify the complete flow:
   * 1. User sends a message -> saveChatMessage persists it
   * 2. Page is refreshed -> getChatHistory retrieves it
   * 3. Messages appear like WhatsApp (oldest first in conversation)
   */

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should persist message and retrieve it after "refresh" (simulated)', async () => {
    const messageData = {
      senderId: "admin-1",
      senderName: "Admin User",
      senderRole: "ADMIN",
      recipientId: "mfg-1",
      message: "Important update about batch #123",
      timestamp: new Date(),
    };

    // 1. Send message (this persists to DB)
    mockCreate.mockResolvedValueOnce({
      id: "persisted-msg-1",
      ...messageData,
      createdAt: new Date(),
    });

    const saveResult = await saveChatMessage(messageData);
    expect(saveResult.success).toBe(true);

    // 2. Simulate page refresh - fetch history
    const storedMessages = [
      {
        id: "persisted-msg-1",
        senderId: "admin-1",
        recipientId: "mfg-1",
        message: "Important update about batch #123",
        createdAt: new Date(),
        sender: {
          id: "admin-1",
          name: "Admin User",
          email: "admin@test.com",
          role: "ADMIN",
        },
      },
    ];

    mockFindMany.mockResolvedValueOnce(storedMessages);

    const historyResult = await getChatHistory({
      userId: "admin-1",
      recipientId: "mfg-1",
    });

    // 3. Verify message is retrieved
    expect(historyResult.success).toBe(true);
    expect(historyResult.messages).toHaveLength(1);
    expect(historyResult.messages![0]!.message).toBe(
      "Important update about batch #123",
    );
    expect(historyResult.messages![0]!.senderId).toBe("admin-1");
    expect(historyResult.messages![0]!.recipientId).toBe("mfg-1");
  });

  it("should maintain message order (oldest first) for conversation view", async () => {
    const mockConversation = [
      {
        id: "msg-1",
        senderId: "admin-1",
        recipientId: "mfg-1",
        message: "First message",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        sender: { id: "admin-1", name: "Admin", email: "", role: "ADMIN" },
      },
      {
        id: "msg-2",
        senderId: "mfg-1",
        recipientId: "admin-1",
        message: "Reply from manufacturer",
        createdAt: new Date("2026-01-01T10:05:00Z"),
        sender: {
          id: "mfg-1",
          name: "Manufacturer",
          email: "",
          role: "MANUFACTURER",
        },
      },
      {
        id: "msg-3",
        senderId: "admin-1",
        recipientId: "mfg-1",
        message: "Second message from admin",
        createdAt: new Date("2026-01-01T10:10:00Z"),
        sender: { id: "admin-1", name: "Admin", email: "", role: "ADMIN" },
      },
    ];

    mockFindMany.mockResolvedValueOnce(mockConversation);

    const result = await getChatHistory({
      userId: "admin-1",
      recipientId: "mfg-1",
    });

    expect(result.success).toBe(true);
    expect(result.messages![0]!.message).toBe("First message");
    expect(result.messages![1]!.message).toBe("Reply from manufacturer");
    expect(result.messages![2]!.message).toBe("Second message from admin");
  });
});
