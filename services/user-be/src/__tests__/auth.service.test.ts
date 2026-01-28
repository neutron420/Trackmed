// Mock Prisma client
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cart: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-123"),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "test-access-token"),
}));

import bcrypt from "bcryptjs";
import prisma from "../config/database";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  changePassword,
} from "../services/auth.service";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const validInput = {
      email: "test@example.com",
      password: "Password123",
      name: "Test User",
      phone: "9876543210",
    };

    it("should successfully register a new user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        phone: "9876543210",
        role: "CONSUMER",
        createdAt: new Date(),
      });
      (prisma.cart.create as jest.Mock).mockResolvedValue({ id: "cart-123" });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        token: "refresh-token",
      });

      const result = await registerUser(validInput);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should reject registration with existing email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing-user",
        email: "test@example.com",
      });

      const result = await registerUser(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email already registered");
    });

    it("should lowercase email during registration", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "CONSUMER",
        createdAt: new Date(),
      });
      (prisma.cart.create as jest.Mock).mockResolvedValue({ id: "cart-123" });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        token: "refresh-token",
      });

      await registerUser({ ...validInput, email: "TEST@EXAMPLE.COM" });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("loginUser", () => {
    const validInput = {
      email: "test@example.com",
      password: "Password123",
      deviceId: "device-123",
      deviceName: "iPhone",
    };

    it("should successfully login a valid user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        role: "CONSUMER",
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        token: "refresh-token",
      });

      const result = await loginUser(validInput);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it("should reject login with non-existent email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await loginUser(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid email or password");
    });

    it("should reject login with wrong password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        role: "CONSUMER",
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await loginUser(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid email or password");
    });

    it("should reject login for inactive user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: "CONSUMER",
        isActive: false,
      });

      const result = await loginUser(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Account is deactivated");
    });

    it("should reject login for non-consumer roles", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: "ADMIN",
        isActive: true,
      });

      const result = await loginUser(validInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid account type for this app");
    });
  });

  describe("refreshAccessToken", () => {
    it("should generate new access token with valid refresh token", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "token-123",
        token: "valid-refresh-token",
        isRevoked: false,
        expiresAt: futureDate,
        user: {
          id: "user-123",
          email: "test@example.com",
          role: "CONSUMER",
          isActive: true,
        },
      });

      const result = await refreshAccessToken("valid-refresh-token");

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
    });

    it("should reject invalid refresh token", async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await refreshAccessToken("invalid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid refresh token");
    });

    it("should reject revoked refresh token", async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "token-123",
        isRevoked: true,
        user: { id: "user-123", isActive: true },
      });

      const result = await refreshAccessToken("revoked-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Token has been revoked");
    });

    it("should reject expired refresh token", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "token-123",
        isRevoked: false,
        expiresAt: pastDate,
        user: { id: "user-123", isActive: true },
      });
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});

      const result = await refreshAccessToken("expired-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Refresh token expired");
    });
  });

  describe("logoutUser", () => {
    it("should revoke refresh token on logout", async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const result = await logoutUser("refresh-token");

      expect(result.success).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: "refresh-token" },
        data: { isRevoked: true },
      });
    });
  });

  describe("logoutAllDevices", () => {
    it("should revoke all refresh tokens for user", async () => {
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const result = await logoutAllDevices("user-123");

      expect(result.success).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: { isRevoked: true },
      });
    });
  });

  describe("changePassword", () => {
    it("should successfully change password with correct current password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        passwordHash: "old-hash",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("new-hash");
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      const result = await changePassword(
        "user-123",
        "oldPassword",
        "newPassword",
      );

      expect(result.success).toBe(true);
    });

    it("should reject password change with wrong current password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        passwordHash: "old-hash",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await changePassword(
        "user-123",
        "wrongPassword",
        "newPassword",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Current password is incorrect");
    });

    it("should reject password change for non-existent user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await changePassword(
        "invalid-user",
        "oldPassword",
        "newPassword",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });
});
