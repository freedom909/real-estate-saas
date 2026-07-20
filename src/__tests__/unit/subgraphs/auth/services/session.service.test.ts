import "reflect-metadata";
import { SessionService } from "@/subgraphs/auth/infrastructure/services/session.service";
import { createHash } from "crypto";
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
}));

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid-123"),
}));

describe("SessionService", () => {
  let service: SessionService;
  const FIXED_DATE = new Date("2024-01-01T00:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
    process.env.ACCESS_TOKEN_SECRET = "test-secret";

    service = new SessionService();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.ACCESS_TOKEN_SECRET;
  });

  describe("createSession", () => {
    it("should create a session with access and refresh tokens", async () => {
      const input = {
        userId: "user-123",
        deviceId: "device-abc",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      const result = await service.createSession(input);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

    it("should generate tokens with correct payload", async () => {
      const jwt = require("jsonwebtoken");

      const input = {
        userId: "user-123",
        deviceId: "device-abc",
      };

      await service.createSession(input);

      expect(jwt.sign).toHaveBeenCalledTimes(2);

      // Access token call
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: "user-123",
          sessionId: "mock-uuid-123",
          type: "access",
        }),
        "test-secret",
        { expiresIn: "1125m" }
      );

      // Refresh token call
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: "user-123",
          sessionId: "mock-uuid-123",
          type: "refresh",
        }),
        "test-secret",
        { expiresIn: "7d" }
      );
    });

    it("should handle missing optional fields", async () => {
      const input = {
        userId: "user-123",
      };

      const result = await service.createSession(input);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });
  });

  describe("revokeSession", () => {
    it("should revoke a session without error", async () => {
      await expect(service.revokeSession("sess-123")).resolves.toBeUndefined();
    });
  });
});
