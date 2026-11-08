import "reflect-metadata";
import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals";
import { RefreshTokenUseCase } from "@/subgraphs/auth/application/usecases/refreshToken.usecase";

// Mock jsonwebtoken — verify() is controlled per-test via mockReturnValue / mockImplementation
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// Mock uuid — deterministic new jti
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("new-jti-456"),
}));

describe("RefreshTokenUseCase", () => {
  let useCase: RefreshTokenUseCase;
  let mockSessionService: {
    rotateRefreshTokenId: jest.Mock<(...args: any[]) => Promise<boolean>>;
    issueTokenPair: jest.Mock<(...args: any[]) => { accessToken: string; refreshToken: string }>;
  };
  let mockRefreshTokenRepo: {
    consume: jest.Mock<(...args: any[]) => Promise<any>>;
    save: jest.Mock<(...args: any[]) => Promise<void>>;
  };

  const VALID_PAYLOAD = {
    sub: "user-123",
    sessionId: "sess-abc",
    jti: "old-jti-111",
    type: "refresh",
    role: "HOST",
    email: "host@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = "test-secret";

    mockSessionService = {
      rotateRefreshTokenId: jest.fn<(...args: any[]) => Promise<boolean>>()
        .mockResolvedValue(true),
      issueTokenPair: jest.fn<(...args: any[]) => { accessToken: string; refreshToken: string }>()
        .mockReturnValue({ accessToken: "new-access", refreshToken: "new-refresh" }),
    };

    mockRefreshTokenRepo = {
      consume: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        userId: "user-123",
        sessionId: "sess-abc",
        deviceId: "device-abc",
      }),
      save: jest.fn<(...args: any[]) => Promise<void>>().mockResolvedValue(undefined),
    };

    useCase = new RefreshTokenUseCase(
      mockSessionService as any,
      mockRefreshTokenRepo as any
    );
  });

  afterEach(() => {
    delete process.env.ACCESS_TOKEN_SECRET;
  });

  describe("execute — happy path", () => {
    it("rotates the token: consumes old (Redis), rotates jti (Mongo CAS), issues and saves the new pair", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);

      const result = await useCase.execute({ refreshToken: "old-token" });

      // 1. self-verified JWT
      expect(jwt.verify).toHaveBeenCalledWith("old-token", "test-secret");

      // 2. Redis single-use consumption of the OLD token
      expect(mockRefreshTokenRepo.consume).toHaveBeenCalledWith("old-token");

      // 3. Mongo atomic rotation: old jti → new jti
      expect(mockSessionService.rotateRefreshTokenId).toHaveBeenCalledWith({
        sessionId: "sess-abc",
        userId: "user-123",
        oldRefreshTokenId: "old-jti-111",
        newRefreshTokenId: "new-jti-456",
      });

      // 4. new pair issued from the verified claims (incl. role/email passthrough)
      expect(mockSessionService.issueTokenPair).toHaveBeenCalledWith({
        userId: "user-123",
        sessionId: "sess-abc",
        refreshTokenId: "new-jti-456",
        role: "HOST",
        email: "host@example.com",
      });

      // 5. new refresh token persisted in Redis with the carried-over deviceId
      expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          token: "new-refresh",
          sessionId: "sess-abc",
          deviceId: "device-abc",
          ttl: 7 * 24 * 60 * 60,
        })
      );

      expect(result).toEqual({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });
    });

    it("never touches activeTenantId (tenant context survives rotation)", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);

      await useCase.execute({ refreshToken: "old-token" });

      const rotateArg =
        mockSessionService.rotateRefreshTokenId.mock.calls[0][0] as Record<string, unknown>;
      const saveArg = mockRefreshTokenRepo.save.mock.calls[0][0] as Record<string, unknown>;
      expect(rotateArg).not.toHaveProperty("activeTenantId");
      expect(saveArg).not.toHaveProperty("activeTenantId");
    });
  });

  describe("execute — JWT self-verification", () => {
    it("rejects a forged/expired token without touching any store", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(
        useCase.execute({ refreshToken: "forged" })
      ).rejects.toThrow("Invalid or expired refresh token");

      expect(mockRefreshTokenRepo.consume).not.toHaveBeenCalled();
      expect(mockSessionService.rotateRefreshTokenId).not.toHaveBeenCalled();
    });

    it("rejects an access token used as refresh token", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue({ ...VALID_PAYLOAD, type: "access" });

      await expect(
        useCase.execute({ refreshToken: "access-token" })
      ).rejects.toThrow("Invalid refresh token");
    });

    it("rejects a payload without jti", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue({ ...VALID_PAYLOAD, jti: undefined });

      await expect(
        useCase.execute({ refreshToken: "no-jti" })
      ).rejects.toThrow("Invalid refresh token");
    });
  });

  describe("execute — reuse / replay detection", () => {
    it("rejects when Redis no longer knows the token (already consumed)", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);
      mockRefreshTokenRepo.consume.mockResolvedValue(null);

      await expect(
        useCase.execute({ refreshToken: "replayed" })
      ).rejects.toThrow("Refresh token already used or revoked");

      // must not rotate or issue anything
      expect(mockSessionService.rotateRefreshTokenId).not.toHaveBeenCalled();
      expect(mockSessionService.issueTokenPair).not.toHaveBeenCalled();
    });

    it("rejects when the Redis record belongs to another user/session", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);
      mockRefreshTokenRepo.consume.mockResolvedValue({
        userId: "someone-else",
        sessionId: "sess-abc",
        deviceId: "device-abc",
      });

      await expect(
        useCase.execute({ refreshToken: "mismatched" })
      ).rejects.toThrow("Refresh token already used or revoked");
    });

    it("rejects when Mongo CAS rotation fails (jti already rotated)", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);
      mockSessionService.rotateRefreshTokenId.mockResolvedValue(false);

      await expect(
        useCase.execute({ refreshToken: "old-token" })
      ).rejects.toThrow("Session revoked or token already rotated");

      // no new pair may be issued on a failed rotation
      expect(mockSessionService.issueTokenPair).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepo.save).not.toHaveBeenCalled();
    });
  });
});
