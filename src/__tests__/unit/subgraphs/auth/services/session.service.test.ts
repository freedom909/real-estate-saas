import "reflect-metadata";
import SessionService from "../../../../../subgraphs/auth/services/session.service";
import SessionRepository from "../../../../../subgraphs/auth/repos/session.repo";
import { createHash } from "crypto";
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { Session } from "inspector";

interface AuthSession {
  id: string;
  userId: string;
  familyId: string;
  deviceId: string;
  userAgentHash: string;
  ipHash: string;
  refreshTokenId: string;
  revoked?: boolean;
  revokedAt?: Date;
  lastSeenAt?: Date;
  expiresAt?: Date;
}

// Mock SessionRepository
type MockedSessionRepo = {
  create: jest.Mock<(data: any) => Promise<AuthSession>>;
  findById: jest.Mock<(id: string) => Promise<AuthSession | null>>;
  update: jest.Mock<(id: string, data: any) => Promise<any>>;
  revoke: jest.Mock<(id: string) => Promise<boolean>>;
  deleteMany: jest.Mock<(filter: any) => Promise<{ deletedCount: number }>>;
};



function createMockSession(
  overrides: Partial<AuthSession> = {}
): AuthSession {
  return {
    id: "sess-1",
    userId: "user-1",
    familyId: "fam-1",
    deviceId: "dev-1",
    ipHash: "ip-hash",
    userAgentHash: "ua-hash",
    refreshTokenId: "jti-1",
    expiresAt: new Date(),
    revoked: false,
    ...overrides,
  };
}
const mockSessionRepo: MockedSessionRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  revoke: jest.fn(),
  deleteMany: jest.fn(),
};

describe("SessionService", () => {
  let service: SessionService;
  const FIXED_DATE = new Date("2024-01-01T00:00:00.000Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);

    // Instantiate service directly with mock (skipping container)
    service = new SessionService(mockSessionRepo as unknown as SessionRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("createSession", () => {
    const params = {
      userId: "user-123",
      deviceId: "device-abc",
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      refreshTokenId: "jti-001",
      familyId: "fam-001",
    };

    it("should successfully create a session with hashed sensitive data and 7-day expiry", async () => {
      // Arrange
      const expectedIpHash = createHash("sha256").update(params.ip).digest("hex");
      const expectedUaHash = createHash("sha256").update(params.userAgent).digest("hex");
      const expectedExpiresAt = new Date(FIXED_DATE.getTime() + 7 * 24 * 60 * 60 * 1000);

      const mockCreatedSession: AuthSession = {
        id: "sess-1",
        userId: "user-1",
        familyId: "fam-1",
        deviceId: "dev-1",

        // ✅ 必须是 hash
        ipHash: "hashed-ip",
        userAgentHash: "hashed-ua",

        refreshTokenId: "jti-1",
        expiresAt: new Date(),
      };
      mockSessionRepo.create.mockResolvedValue(mockCreatedSession);//

      // Act
      const result = await service.createSession(params);

      // Assert
      expect(mockSessionRepo.create).toHaveBeenCalledTimes(1);
      expect(mockSessionRepo.create).toHaveBeenCalledWith({
        userId: params.userId,
        deviceId: params.deviceId,
        ipHash: expectedIpHash,
        userAgentHash: expectedUaHash,
        refreshTokenId: params.refreshTokenId,
        familyId: params.familyId,
        expiresAt: expectedExpiresAt,
      });
      expect(result).toEqual(mockCreatedSession);
    });

    it("should handle empty IP and UserAgent by producing empty hashes", async () => {
      // Arrange
      const emptyParams = { ...params, ip: "", userAgent: "" };
      mockSessionRepo.create.mockResolvedValue(
        createMockSession({ id: "sess-empty" })
      )
      // Act
      await service.createSession(emptyParams);

      // Assert
      expect(mockSessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipHash: "",
          userAgentHash: "",
        })
      );
    });

    it("should propagate repository errors", async () => {
      // Arrange
      const error = new Error("DB Connection Failed");
      mockSessionRepo.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createSession(params)).rejects.toThrow(error);
    });
  });

  describe("findBySessionId", () => {
    it("should return the session if found", async () => {
      const mockSession = createMockSession({
        id: "sess-123",
        userId: "user-1",
      });

      mockSessionRepo.findById.mockResolvedValue(mockSession);

      const result = await service.findBySessionId("sess-123");

      expect(mockSessionRepo.findById).toHaveBeenCalledWith("sess-123");
      expect(result).toEqual(mockSession);
    });

    it("should return null if session not found", async () => {
      mockSessionRepo.findById.mockResolvedValue(null);

      const result = await service.findBySessionId("sess-missing");

      expect(result).toBeNull();
    });
  });

  describe("updateRefreshTokenId", () => {
    it("should update refreshTokenId and lastSeenAt timestamp", async () => {
      // Arrange
      const sessionId = "sess-123";
      const newJti = "jti-new";
      mockSessionRepo.update.mockResolvedValue({ id: sessionId, refreshTokenId: newJti });

      // Act
      await service.updateRefreshTokenId(sessionId, newJti);

      // Assert
      expect(mockSessionRepo.update).toHaveBeenCalledWith(sessionId, {
        refreshTokenId: newJti,
        lastSeenAt: FIXED_DATE, // Matches the frozen system time
      });
    });

    it("should propagate repository errors during update", async () => {
      mockSessionRepo.update.mockRejectedValue(new Error("Update failed"));
      await expect(service.updateRefreshTokenId("id", "jti")).rejects.toThrow("Update failed");
    });
  });

  describe("revokeSession", () => {
    it("should call revoke on repository", async () => {
      mockSessionRepo.revoke.mockResolvedValue(true);

      await service.revokeSession("sess-123");

      expect(mockSessionRepo.revoke).toHaveBeenCalledWith("sess-123");
    });
  });

  describe("revokeFamily", () => {
    it("should call deleteMany with familyId", async () => {
      const familyId = "fam-123";
      const deleteResult = { deletedCount: 5 };
      mockSessionRepo.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.revokeFamily(familyId);

      expect(mockSessionRepo.deleteMany).toHaveBeenCalledWith({ familyId });
      expect(result).toEqual(deleteResult);
    });
  });
});