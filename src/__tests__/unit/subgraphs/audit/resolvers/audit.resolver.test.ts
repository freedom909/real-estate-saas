// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockExecute = jest.fn();
const mockWriteAuditLog = jest.fn();

const mockResolve = jest.fn();
jest.mock("tsyringe", () => ({
  container: {
    resolve: mockResolve,
  },
}));

import { resolvers } from "@/subgraphs/audit/resolvers/audit.resolver";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

function mockServices() {
  mockResolve.mockImplementation((token: symbol) => {
    if (token === TOKENS_AUDIT.services.getAuditLogsQuery) {
      return { execute: mockExecute };
    }
    if (token === TOKENS_AUDIT.services.auditLogger) {
      return { writeAuditLog: mockWriteAuditLog };
    }
    return null;
  });
}

describe("Audit Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServices();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Query.getAuditLogs
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Query.getAuditLogs", () => {
    it("should return audit logs for the given filter", async () => {
      const mockLogs = [
        { id: "log-1", action: "LOGIN", userId: "u1" },
        { id: "log-2", action: "UPDATE", userId: "u1" },
      ];
      mockExecute.mockResolvedValue(mockLogs);

      const filter = { userId: "u1" };
      const result = await (resolvers as any).Query.getAuditLogs(null, { filter });

      expect(mockResolve).toHaveBeenCalledWith(TOKENS_AUDIT.services.getAuditLogsQuery);
      expect(mockExecute).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(2);
    });

    it("should default to an empty filter when none is provided", async () => {
      mockExecute.mockResolvedValue([]);

      const result = await (resolvers as any).Query.getAuditLogs(null, {});

      expect(mockExecute).toHaveBeenCalledWith({});
      expect(result).toEqual([]);
    });

    it("should propagate query errors", async () => {
      mockExecute.mockRejectedValue(new Error("DB connection failed"));

      await expect(
        (resolvers as any).Query.getAuditLogs(null, { filter: {} })
      ).rejects.toThrow("DB connection failed");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Mutation.recordAuditLog
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Mutation.recordAuditLog", () => {
    it("should write an audit log and return it", async () => {
      const input = { action: "LOGIN", userId: "u1", resource: "session" };
      const created = { id: "log-1", ...input };
      mockWriteAuditLog.mockResolvedValue(created);

      const result = await (resolvers as any).Mutation.recordAuditLog(null, { input });

      expect(mockResolve).toHaveBeenCalledWith(TOKENS_AUDIT.services.auditLogger);
      expect(mockWriteAuditLog).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });

    it("should propagate write errors", async () => {
      mockWriteAuditLog.mockRejectedValue(new Error("Write failed"));

      await expect(
        (resolvers as any).Mutation.recordAuditLog(null, { input: { action: "X" } })
      ).rejects.toThrow("Write failed");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // AuditLog.user (entity reference mapping)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("AuditLog.user", () => {
    it("should map userId to a User entity reference", () => {
      const result = (resolvers as any).AuditLog.user({ userId: "u-9" });
      expect(result).toEqual({ __typename: "User", id: "u-9" });
    });

    it("should return null when userId is missing", () => {
      expect((resolvers as any).AuditLog.user({})).toBeNull();
      expect((resolvers as any).AuditLog.user({ userId: null })).toBeNull();
    });
  });
});
