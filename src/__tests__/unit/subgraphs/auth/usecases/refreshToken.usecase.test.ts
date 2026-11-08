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
     revokeSession: jest.Mock<(...args: any[]) => Promise<void>>;
  };
  let mockRefreshTokenRepo: {
    get: jest.Mock<(...args: any[]) => Promise<any>>;
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
      revokeSession: jest.fn<(...args: any[]) => Promise<void>>().mockResolvedValue(undefined),
    };

    mockRefreshTokenRepo = {
      get: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        userId: "user-123",
        sessionId: "sess-abc",
        deviceId: "device-abc",
      }),

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
      expect(jwt.verify).toHaveBeenCalledWith("old-token", "test-secret", { algorithms: ["HS256"] });

      // 2. Redis pre-check: inspect the old token without consuming it
      expect(mockRefreshTokenRepo.get).toHaveBeenCalledWith("old-token");

      // 3. Mongo atomic CAS: old jti → new jti
      expect(mockSessionService.rotateRefreshTokenId).toHaveBeenCalledWith({
        sessionId: "sess-abc",
        userId: "user-123",
        oldRefreshTokenId: "old-jti-111",
        newRefreshTokenId: "new-jti-456",
      });

      // 4. Redis single-use consumption happens after successful CAS
      expect(mockRefreshTokenRepo.consume).toHaveBeenCalledWith("old-token");

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
      mockRefreshTokenRepo.get.mockResolvedValue({});
      await expect(
        useCase.execute({ refreshToken: "replayed" })
      ).rejects.toThrow("Refresh token already used or revoked");

      expect(mockSessionService.rotateRefreshTokenId).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepo.consume).not.toHaveBeenCalled();
      expect(mockSessionService.issueTokenPair).not.toHaveBeenCalled();
    });

    it("rejects when the Redis record belongs to another user/session", async () => {
      const jwt = require("jsonwebtoken");
      jwt.verify.mockReturnValue(VALID_PAYLOAD);

      // Redis returns metadata belonging to another user.
      mockRefreshTokenRepo.get.mockResolvedValue({
        userId: "someone-else",
        sessionId: "sess-abc",
        deviceId: "device-abc",
      });

      await expect(
        useCase.execute({ refreshToken: "old-token" })
      ).rejects.toThrow("Refresh token already used or revoked");

      // Redis pre-check must happen.
      expect(mockRefreshTokenRepo.get).toHaveBeenCalledWith("old-token");

      // Reject before Mongo CAS.
      expect(mockSessionService.rotateRefreshTokenId).not.toHaveBeenCalled();

      // Do not consume or issue tokens.
      expect(mockRefreshTokenRepo.consume).not.toHaveBeenCalled();
      expect(mockSessionService.issueTokenPair).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepo.save).not.toHaveBeenCalled();
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

  describe("execute — failure compensation", () => {

  it("revokes the session when Redis consume fails after Mongo CAS succeeds", async () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValue(VALID_PAYLOAD);

    // Redis pre-check succeeds.
    mockRefreshTokenRepo.get.mockResolvedValue({
      userId: "user-123",
      sessionId: "sess-abc",
      deviceId: "device-abc",
    });

    // Mongo CAS succeeds.
    mockSessionService.rotateRefreshTokenId.mockResolvedValue(true);

    // Redis consume fails.
    mockRefreshTokenRepo.consume.mockRejectedValue(
      new Error("Redis consume failed")
    );

    await expect(
      useCase.execute({ refreshToken: "old-token" })
    ).rejects.toThrow("Redis consume failed");

    // Mongo CAS must have succeeded before compensation.
    expect(mockSessionService.rotateRefreshTokenId).toHaveBeenCalled();

    // Session must be revoked.
    expect(mockSessionService.revokeSession)
      .toHaveBeenCalledWith("sess-abc");

    // No new token pair may be issued.
    expect(mockSessionService.issueTokenPair).not.toHaveBeenCalled();

    // No new refresh token may be saved.
    expect(mockRefreshTokenRepo.save).not.toHaveBeenCalled();
  });
})

  it("revokes the session when Redis save fails after token issuance", async () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValue(VALID_PAYLOAD);

    // Redis pre-check succeeds.
    mockRefreshTokenRepo.get.mockResolvedValue({
      userId: "user-123",
      sessionId: "sess-abc",
      deviceId: "device-abc",
    });

    // Mongo CAS succeeds.
    mockSessionService.rotateRefreshTokenId.mockResolvedValue(true);

    // Redis consume succeeds.
    mockRefreshTokenRepo.consume.mockResolvedValue({
      userId: "user-123",
      sessionId: "sess-abc",
      deviceId: "device-abc",
    });

    // Token issuance succeeds.
    mockSessionService.issueTokenPair.mockReturnValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });

    // Redis save fails.
    mockRefreshTokenRepo.save.mockRejectedValue(
      new Error("Redis save failed")
    );

    await expect(
      useCase.execute({ refreshToken: "old-token" })
    ).rejects.toThrow("Redis save failed");

    // Mongo CAS must have succeeded.
    expect(mockSessionService.rotateRefreshTokenId).toHaveBeenCalled();

    // Old token must have been consumed.
    expect(mockRefreshTokenRepo.consume)
      .toHaveBeenCalledWith("old-token");

    // New tokens were issued, but could not be persisted.
    expect(mockSessionService.issueTokenPair).toHaveBeenCalled();

    // Session must be revoked.
    expect(mockSessionService.revokeSession)
      .toHaveBeenCalledWith("sess-abc");

    // Redis save was attempted.
    expect(mockRefreshTokenRepo.save).toHaveBeenCalled();
  });
});
