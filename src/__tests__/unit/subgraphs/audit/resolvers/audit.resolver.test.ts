import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ─── Mocks (must be before imports) ──────────────────────────────────────────

const mockGetAuditLog = jest.fn();
const mockGetLogsByResource = jest.fn();
const mockCreateLog = jest.fn();

jest.mock("@/subgraphs/audit/services/audit.service", () => ({
  AuditService: jest.fn().mockImplementation(() => ({
    getAuditLog: mockGetAuditLog,
    getLogsByResource: mockGetLogsByResource,
    createLog: mockCreateLog,
  })),
}));

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn((id: string) => /^[0-9a-f]{24}$/i.test(id)),
      },
    },
  },
  Types: {
    ObjectId: {
      isValid: jest.fn((id: string) => /^[0-9a-f]{24}$/i.test(id)),
    },
  },
}));

const mockResolve = jest.fn();
jest.mock("tsyringe", () => ({
  container: {
    resolve: mockResolve,
  },
}));

// ─── Import after mocks ──────────────────────────────────────────────────────

import { resolvers } from "@/subgraphs/audit/resolvers/audit.resolver";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_ID = "507f1f77bcf86cd799439011";

function mockAuditService() {
  const service = {
    getAuditLog: mockGetAuditLog,
    getLogsByResource: mockGetLogsByResource,
    createLog: mockCreateLog,
  };
  mockResolve.mockReturnValue(service);
  return service;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Audit Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Query.getAuditLog
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Query.getAuditLog", () => {
    it("should resolve audit log by userId", async () => {
      const mockLog = { id: "log-1", action: "LOGIN", userId: VALID_ID };
      mockGetAuditLog.mockResolvedValue(mockLog);
      mockAuditService();

      const result = await (resolvers as any).Query.getAuditLog(
        null,
        { userId: VALID_ID }
      );

      expect(mockResolve).toHaveBeenCalled();
      expect(mockGetAuditLog).toHaveBeenCalledWith(VALID_ID);
      expect(result).toEqual(mockLog);
    });

    it("should return null when audit log not found", async () => {
      mockGetAuditLog.mockResolvedValue(null);
      mockAuditService();

      const result = await (resolvers as any).Query.getAuditLog(
        null,
        { userId: VALID_ID }
      );

      expect(result).toBeNull();
    });

    it("should propagate service errors", async () => {
      mockGetAuditLog.mockRejectedValue(new Error("DB connection failed"));
      mockAuditService();

      await expect(
        (resolvers as any).Query.getAuditLog(null, { userId: VALID_ID })
      ).rejects.toThrow("DB connection failed");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Query.getAuditLogsByResource
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Query.getAuditLogsByResource", () => {
    it("should return audit logs for a resource", async () => {
      const mockLogs = [
        { id: "log-1", action: "LOGIN", resourceId: VALID_ID },
        { id: "log-2", action: "UPDATE", resourceId: VALID_ID },
      ];
      mockGetLogsByResource.mockResolvedValue(mockLogs);
      mockAuditService();

      const result = await (resolvers as any).Query.getAuditLogsByResource(
        null,
        { resourceId: VALID_ID }
      );

      expect(mockGetLogsByResource).toHaveBeenCalledWith(VALID_ID);
      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no logs found", async () => {
      mockGetLogsByResource.mockResolvedValue([]);
      mockAuditService();

      const result = await (resolvers as any).Query.getAuditLogsByResource(
        null,
        { resourceId: VALID_ID }
      );

      expect(result).toEqual([]);
    });

    it("should propagate service errors", async () => {
      mockGetLogsByResource.mockRejectedValue(new Error("Query timeout"));
      mockAuditService();

      await expect(
        (resolvers as any).Query.getAuditLogsByResource(null, {
          resourceId: VALID_ID,
        })
      ).rejects.toThrow("Query timeout");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Mutation.recordAuditLog
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Mutation.recordAuditLog", () => {
    it("should create audit log with valid inputs", async () => {
      const mockLog = {
        id: "log-1",
        action: "LOGIN",
        userId: VALID_ID,
        resourceId: VALID_ID,
        timestamp: new Date(),
      };
      mockCreateLog.mockResolvedValue(mockLog);
      mockAuditService();

      const result = await (resolvers as any).Mutation.recordAuditLog(
        null,
        {
          action: "LOGIN",
          userId: VALID_ID,
          resourceId: VALID_ID,
        }
      );

      expect(mockCreateLog).toHaveBeenCalledWith(
        "LOGIN",
        VALID_ID,
        VALID_ID,
        undefined
      );
      expect(result).toEqual(mockLog);
    });

    it("should create audit log with metadata", async () => {
      const mockLog = { id: "log-1", action: "UPDATE" };
      mockCreateLog.mockResolvedValue(mockLog);
      mockAuditService();

      await (resolvers as any).Mutation.recordAuditLog(null, {
        action: "UPDATE",
        userId: VALID_ID,
        resourceId: VALID_ID,
        metadata: '{"field":"email"}',
      });

      expect(mockCreateLog).toHaveBeenCalledWith(
        "UPDATE",
        VALID_ID,
        VALID_ID,
        '{"field":"email"}'
      );
    });

    it("should create audit log without resourceId (optional)", async () => {
      const mockLog = { id: "log-1", action: "LOGIN" };
      mockCreateLog.mockResolvedValue(mockLog);
      mockAuditService();

      await (resolvers as any).Mutation.recordAuditLog(null, {
        action: "LOGIN",
        userId: VALID_ID,
      });

      expect(mockCreateLog).toHaveBeenCalledWith(
        "LOGIN",
        VALID_ID,
        undefined,
        undefined
      );
    });

    // ── Validation ──────────────────────────────────────────────────────────

    it("should throw when userId is missing", async () => {
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
        })
      ).rejects.toThrow("Invalid or missing userId");
    });

    it("should throw when userId is empty string", async () => {
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
          userId: "",
        })
      ).rejects.toThrow("Invalid or missing userId");
    });

    it("should throw when userId is invalid ObjectId", async () => {
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
          userId: "not-a-valid-id",
        })
      ).rejects.toThrow("Invalid or missing userId");
    });

    it("should throw when resourceId is invalid ObjectId", async () => {
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
          userId: VALID_ID,
          resourceId: "bad-resource-id",
        })
      ).rejects.toThrow("Invalid resourceId");
    });

    it("should accept valid resourceId", async () => {
      mockCreateLog.mockResolvedValue({ id: "log-1" });
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
          userId: VALID_ID,
          resourceId: VALID_ID,
        })
      ).resolves.toBeDefined();
    });

    it("should propagate service errors on create", async () => {
      mockCreateLog.mockRejectedValue(new Error("Duplicate key error"));
      mockAuditService();

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, {
          action: "LOGIN",
          userId: VALID_ID,
          resourceId: VALID_ID,
        })
      ).rejects.toThrow("Duplicate key error");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AuditLog.user (field resolver)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("AuditLog.user", () => {
    it("should return User federation reference", () => {
      const parent = { userId: "user-123", action: "LOGIN" };

      const result = (resolvers as any).AuditLog.user(parent);

      expect(result).toEqual({
        __typename: "User",
        id: "user-123",
      });
    });

    it("should use parent.userId as the user id", () => {
      const parent = { userId: "abc-456" };

      const result = (resolvers as any).AuditLog.user(parent);

      expect(result.id).toBe("abc-456");
    });

    it("should always set __typename to User", () => {
      const parent = { userId: "any-id" };

      const result = (resolvers as any).AuditLog.user(parent);

      expect(result.__typename).toBe("User");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Resolver structure
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Resolver structure", () => {
    it("should export Query with getAuditLog and getAuditLogsByResource", () => {
      expect(resolvers.Query).toBeDefined();
      expect(typeof resolvers.Query.getAuditLog).toBe("function");
      expect(typeof resolvers.Query.getAuditLogsByResource).toBe("function");
    });

    it("should export Mutation with recordAuditLog", () => {
      expect(resolvers.Mutation).toBeDefined();
      expect(typeof resolvers.Mutation.recordAuditLog).toBe("function");
    });

    it("should export AuditLog field resolver", () => {
      expect(resolvers.AuditLog).toBeDefined();
      expect(typeof resolvers.AuditLog.user).toBe("function");
    });
  });
});
