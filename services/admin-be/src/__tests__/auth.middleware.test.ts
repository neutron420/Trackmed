import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

// Set JWT_SECRET before importing middleware
process.env.JWT_SECRET = "test-secret-key";

// Import after setting env
import {
  verifyToken,
  requireRole,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

describe("Auth Middleware", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("should reject request without authorization header", () => {
      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. No token provided.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid authorization format", () => {
      mockRequest.headers = { authorization: "InvalidFormat token123" };

      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. No token provided.",
      });
    });

    it("should reject request with empty Bearer token", () => {
      mockRequest.headers = { authorization: "Bearer " };

      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. Invalid token format.",
      });
    });

    it("should accept valid token and set user on request", () => {
      const mockDecoded = { userId: "user-123", role: "ADMIN" };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockRequest.headers = { authorization: "Bearer valid-token" };

      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret-key");
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject expired token", () => {
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });
      mockRequest.headers = { authorization: "Bearer expired-token" };

      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Token expired",
      });
    });

    it("should reject invalid token", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });
      mockRequest.headers = { authorization: "Bearer invalid-token" };

      verifyToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid token",
      });
    });
  });

  describe("requireRole", () => {
    it("should reject unauthenticated request", () => {
      const middleware = requireRole("ADMIN");

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authenticated",
      });
    });

    it("should reject user with insufficient permissions", () => {
      mockRequest.user = { userId: "user-123", role: "USER" };
      const middleware = requireRole("ADMIN");

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. Insufficient permissions.",
      });
    });

    it("should allow user with correct role", () => {
      mockRequest.user = { userId: "user-123", role: "ADMIN" };
      const middleware = requireRole("ADMIN");

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should allow user with one of multiple allowed roles", () => {
      mockRequest.user = { userId: "user-123", role: "MANUFACTURER" };
      const middleware = requireRole("ADMIN", "MANUFACTURER");

      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should continue without setting user when no token provided", () => {
      optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should continue without setting user when invalid format", () => {
      mockRequest.headers = { authorization: "Invalid" };

      optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should set user when valid token provided", () => {
      const mockDecoded = { userId: "user-123", role: "ADMIN" };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockRequest.headers = { authorization: "Bearer valid-token" };

      optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should continue without user when token is invalid", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });
      mockRequest.headers = { authorization: "Bearer invalid-token" };

      optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
