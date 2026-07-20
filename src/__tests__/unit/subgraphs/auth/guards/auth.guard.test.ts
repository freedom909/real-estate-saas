import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

function createMockReq(headers: Record<string, string> = {}) {
  return {
    headers: {
      authorization: undefined,
      ...headers,
    },
  };
}

function createMockRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

function createMockNext() {
  return jest.fn();
}

describe("AuthGuard", () => {
  let authGuard: any;
  let mockJwtService: any;
  let mockSessionRepo: any;
  let mockBlacklist: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJwtService = { verify: jest.fn() };
    mockSessionRepo = { findById: jest.fn() };
    mockBlacklist = { isBlacklisted: jest.fn() };

    const { AuthGuard } = require("@/subgraphs/auth/guards/auth.guard");
    authGuard = new AuthGuard(mockJwtService, mockSessionRepo, mockBlacklist);
  });

  describe("validate", () => {
    it("should return userId and sessionId for valid token", async () => {
      const payload = {
        sub: "user-1",
        sessionId: "sess-1",
        type: "access",
        jti: "jti-1",
      };
      mockJwtService.verify.mockResolvedValue(payload);
      mockSessionRepo.findById.mockResolvedValue({ id: "sess-1", revokedAt: null });
      mockBlacklist.isBlacklisted.mockResolvedValue(false);

      const req = createMockReq({ authorization: "Bearer valid-token" });
      const result = await authGuard.validate(req);

      expect(result).toEqual({ userId: "user-1", sessionId: "sess-1" });
    });

    it("should throw when no authorization header", async () => {
      const req = createMockReq();

      await expect(authGuard.validate(req)).rejects.toThrow("No authorization header");
    });

    it("should throw when authorization header doesn't start with Bearer", async () => {
      const req = createMockReq({ authorization: "Basic abc123" });

      await expect(authGuard.validate(req)).rejects.toThrow("No authorization header");
    });

    it("should throw when token type is not access", async () => {
      mockJwtService.verify.mockResolvedValue({
        sub: "user-1",
        sessionId: "sess-1",
        type: "refresh",
        jti: "jti-1",
      });
      mockBlacklist.isBlacklisted.mockResolvedValue(false);

      const req = createMockReq({ authorization: "Bearer token" });

      await expect(authGuard.validate(req)).rejects.toThrow("Invalid token type");
    });

    it("should throw when sessionId is missing", async () => {
      mockJwtService.verify.mockResolvedValue({
        sub: "user-1",
        type: "access",
        jti: "jti-1",
      });
      mockBlacklist.isBlacklisted.mockResolvedValue(false);

      const req = createMockReq({ authorization: "Bearer token" });

      await expect(authGuard.validate(req)).rejects.toThrow("Missing session ID");
    });

    it("should throw when token is blacklisted", async () => {
      mockJwtService.verify.mockResolvedValue({
        sub: "user-1",
        sessionId: "sess-1",
        type: "access",
        jti: "jti-1",
      });
      mockBlacklist.isBlacklisted.mockResolvedValue(true);

      const req = createMockReq({ authorization: "Bearer token" });

      await expect(authGuard.validate(req)).rejects.toThrow("Token blacklisted");
    });

    it("should throw when session not found", async () => {
      mockJwtService.verify.mockResolvedValue({
        sub: "user-1",
        sessionId: "sess-1",
        type: "access",
        jti: "jti-1",
      });
      mockSessionRepo.findById.mockResolvedValue(null);
      mockBlacklist.isBlacklisted.mockResolvedValue(false);

      const req = createMockReq({ authorization: "Bearer token" });

      await expect(authGuard.validate(req)).rejects.toThrow("Session invalid or revoked");
    });

    it("should throw when session is revoked", async () => {
      mockJwtService.verify.mockResolvedValue({
        sub: "user-1",
        sessionId: "sess-1",
        type: "access",
        jti: "jti-1",
      });
      mockSessionRepo.findById.mockResolvedValue({
        id: "sess-1",
        revokedAt: new Date(),
      });
      mockBlacklist.isBlacklisted.mockResolvedValue(false);

      const req = createMockReq({ authorization: "Bearer token" });

      await expect(authGuard.validate(req)).rejects.toThrow("Session invalid or revoked");
    });
  });

  describe("middleware", () => {
    it("should call next with user on req for valid token", async () => {
      const payload = {
        sub: "user-1",
        sessionId: "sess-1",
        type: "access",
        jti: "jti-1",
      };
      mockJwtService.verify.mockResolvedValue(payload);

      const req = createMockReq({ authorization: "Bearer valid-token" });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = authGuard.middleware();
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toEqual({
        userId: "user-1",
        sessionId: "sess-1",
        type: "access",
      });
    });

    it("should return 401 for missing auth header", async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const middleware = authGuard.middleware();
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing Authorization header" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid token (non-UnauthorizedError)", async () => {
      mockJwtService.verify.mockRejectedValue(new Error("jwt invalid"));

      const req = createMockReq({ authorization: "Bearer invalid" });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = authGuard.middleware();
      await middleware(req, res, next);

      // The error is not UnauthorizedError, so it goes to next(err)
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should call next with error for non-UnauthorizedError", async () => {
      mockJwtService.verify.mockRejectedValue(new Error("Unexpected error"));

      const req = createMockReq({ authorization: "Bearer token" });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = authGuard.middleware();
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
