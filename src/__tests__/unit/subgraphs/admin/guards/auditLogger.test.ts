// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAuditRepo = {
  findAll: jest.fn(),
  findFiltered: jest.fn(),
  create: jest.fn(),
};

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(() => mockAuditRepo),
  },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { auditLogRepository: Symbol.for("AuditLogRepository") },
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "audit-uuid-123"),
}));

import { logAuditAction, withAuditLog } from "@/subgraphs/admin/guards/auditLogger";

describe("auditLogger", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("logAuditAction", () => {
    it("should create an audit log entry", async () => {
      mockAuditRepo.create.mockResolvedValue(undefined);

      const context = {
        admin: { id: "admin-1" },
        req: { ip: "192.168.1.1", headers: {} },
      };

      await logAuditAction(context, {
        action: "CREATE_ADMIN_USER",
        target: "admin_user",
        targetId: "a-new",
        details: "Created admin: test@test.com",
      });

      expect(mockAuditRepo.create).toHaveBeenCalled();
      const logArg = mockAuditRepo.create.mock.calls[0][0];
      expect(logArg.adminId).toBe("admin-1");
      expect(logArg.action).toBe("CREATE_ADMIN_USER");
      expect(logArg.target).toBe("admin_user");
      expect(logArg.targetId).toBe("a-new");
      expect(logArg.ip).toBe("192.168.1.1");
    });

    it("should use user.userId when admin is not in context", async () => {
      mockAuditRepo.create.mockResolvedValue(undefined);

      const context = {
        user: { userId: "user-1" },
        req: { ip: "10.0.0.1", headers: {} },
      };

      await logAuditAction(context, {
        action: "LOGIN",
        target: "session",
      });

      const logArg = mockAuditRepo.create.mock.calls[0][0];
      expect(logArg.adminId).toBe("user-1");
    });

    it("should use 'unknown' when no user info", async () => {
      mockAuditRepo.create.mockResolvedValue(undefined);

      await logAuditAction({}, {
        action: "TEST",
        target: "test",
      });

      const logArg = mockAuditRepo.create.mock.calls[0][0];
      expect(logArg.adminId).toBe("unknown");
      expect(logArg.ip).toBe("unknown");
    });

    it("should use x-forwarded-for header when ip is not direct", async () => {
      mockAuditRepo.create.mockResolvedValue(undefined);

      const context = {
        admin: { id: "a1" },
        req: { ip: undefined, headers: { "x-forwarded-for": "203.0.113.1" } },
      };

      await logAuditAction(context, { action: "TEST", target: "test" });

      const logArg = mockAuditRepo.create.mock.calls[0][0];
      expect(logArg.ip).toBe("203.0.113.1");
    });

    it("should not throw when audit logging fails", async () => {
      mockAuditRepo.create.mockRejectedValue(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(
        logAuditAction({ admin: { id: "a1" }, req: {} }, { action: "TEST", target: "test" })
      ).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("withAuditLog", () => {
    it("should call resolver and then log audit action", async () => {
      mockAuditRepo.create.mockResolvedValue(undefined);
      const mockResolver = jest.fn().mockResolvedValue({ id: "result-1" });
      const auditBuilder = jest.fn().mockReturnValue({
        action: "UPDATE",
        target: "admin_user",
        targetId: "result-1",
      });

      const wrapped = withAuditLog(mockResolver, auditBuilder);
      const context = { admin: { id: "a1" }, req: { ip: "1.1.1.1", headers: {} } };

      const result = await wrapped(null, { input: {} }, context);

      expect(mockResolver).toHaveBeenCalled();
      expect(auditBuilder).toHaveBeenCalledWith({ id: "result-1" }, { input: {} }, context);
      expect(mockAuditRepo.create).toHaveBeenCalled();
      expect(result).toEqual({ id: "result-1" });
    });

    it("should not log when resolver returns null", async () => {
      const mockResolver = jest.fn().mockResolvedValue(null);
      const auditBuilder = jest.fn();

      const wrapped = withAuditLog(mockResolver, auditBuilder);

      const result = await wrapped(null, {}, {});

      expect(result).toBeNull();
      expect(auditBuilder).not.toHaveBeenCalled();
      expect(mockAuditRepo.create).not.toHaveBeenCalled();
    });

    it("should not log when resolver returns undefined", async () => {
      const mockResolver = jest.fn().mockResolvedValue(undefined);
      const auditBuilder = jest.fn();

      const wrapped = withAuditLog(mockResolver, auditBuilder);

      const result = await wrapped(null, {}, {});

      expect(result).toBeUndefined();
      expect(auditBuilder).not.toHaveBeenCalled();
    });
  });
});
