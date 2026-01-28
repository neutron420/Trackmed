// Mock config
jest.mock("../config", () => ({
  config: {
    jwt: {
      userSecret: "test-user-secret",
      adminSecret: "test-admin-secret",
    },
    serviceKeys: {
      adminBe: "admin-service-key",
      userBe: "user-service-key",
    },
  },
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

import jwt from "jsonwebtoken";
import { authenticateClient } from "../auth";

describe("WebSocket Auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authenticateClient", () => {
    describe("Service Authentication", () => {
      it("should authenticate valid admin-be service", () => {
        const result = authenticateClient(
          undefined,
          "admin-service-key",
          "service",
          "admin-be",
        );

        expect(result.success).toBe(true);
        expect(result.clientType).toBe("service");
        expect(result.serviceType).toBe("admin-be");
      });

      it("should authenticate valid user-be service", () => {
        const result = authenticateClient(
          undefined,
          "user-service-key",
          "service",
          "user-be",
        );

        expect(result.success).toBe(true);
        expect(result.clientType).toBe("service");
        expect(result.serviceType).toBe("user-be");
      });

      it("should reject invalid service key", () => {
        const result = authenticateClient(
          undefined,
          "wrong-key",
          "service",
          "admin-be",
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe("Invalid service key");
      });
    });

    describe("User Token Authentication", () => {
      it("should authenticate valid user token", () => {
        (jwt.verify as jest.Mock).mockReturnValue({
          userId: "user-123",
          role: "CONSUMER",
        });

        const result = authenticateClient("valid-user-token");

        expect(result.success).toBe(true);
        expect(result.clientType).toBe("user");
        expect(result.userId).toBe("user-123");
      });

      it("should authenticate valid admin token", () => {
        // First call fails (user token), second call succeeds (admin token)
        (jwt.verify as jest.Mock)
          .mockImplementationOnce(() => {
            throw new Error("Invalid token");
          })
          .mockReturnValueOnce({
            userId: "admin-123",
            role: "ADMIN",
          });

        const result = authenticateClient("valid-admin-token");

        expect(result.success).toBe(true);
        expect(result.clientType).toBe("admin");
        expect(result.userId).toBe("admin-123");
      });

      it("should reject invalid token", () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
          throw new Error("Invalid token");
        });

        const result = authenticateClient("invalid-token");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Invalid token");
      });
    });

    describe("No Authentication", () => {
      it("should reject when no auth provided", () => {
        const result = authenticateClient();

        expect(result.success).toBe(false);
        expect(result.error).toBe("No authentication provided");
      });
    });
  });
});
