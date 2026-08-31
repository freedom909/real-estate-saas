// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAcl = {
  recordAdminAction: jest.fn(),
  listAdminAuditLogs: jest.fn(),
  listRecentAdminAuditLogs: jest.fn(),
  countAdminAuditLogs: jest.fn(),
};

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(() => mockAcl),
  },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    acl: { adminAuditACL: Symbol.for("AdminAuditACL") },
  },
}));

import { logAuditAction, withAuditLog } from "@/subgraphs/admin/guards/auditLogger";

describe("auditLogger (delegates to AdminAuditACL)", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("logAuditAction", () => {
    it("delegates to ACL.recordAdminAction with admin context", async () => {
      mockAcl.recordAdminAction.mockResolvedValue(undefined);

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

      expect(mockAcl.recordAdminAction).toHaveBeenCalledTimes(1);
      const dto = mockAcl.recordAdminAction.mock.calls[0][0];
      expect(dto.adminId).toBe("admin-1");
      expect(dto.action).toBe("CREATE_ADMIN_USER");
      expect(dto.target).toBe("admin_user");
      expect(dto.targetId).toBe("a-new");
      expect(dto.ip).toBe("192.168.1.1");
    });

    it("uses user.userId when admin is not in context", async () => {
      mockAcl.recordAdminAction.mockResolvedValue(undefined);

      const context = {
        user: { userId: "user-1" },
        req: { ip: "10.0.0.1", headers: {} },
      };

      await logAuditAction(context, {
        action: "LOGIN",
        target: "session",
      });

      const dto = mockAcl.recordAdminAction.mock.calls[0][0];
      expect(dto.adminId).toBe("user-1");
    });

    it("uses 'unknown' when no user info", async () => {
      mockAcl.recordAdminAction.mockResolvedValue(undefined);

      await logAuditAction({}, {
        action: "TEST",
        target: "test",
      });

      const dto = mockAcl.recordAdminAction.mock.calls[0][0];
      expect(dto.adminId).toBe("unknown");
      expect(dto.ip).toBe("unknown");
    });

    it("uses x-forwarded-for header when ip is not direct", async () => {
      mockAcl.recordAdminAction.mockResolvedValue(undefined);

      const context = {
        admin: { id: "a1" },
        req: { ip: undefined, headers: { "x-forwarded-for": "203.0.113.1" } },
      };

      await logAuditAction(context, { action: "TEST", target: "test" });

      const dto = mockAcl.recordAdminAction.mock.calls[0][0];
      expect(dto.ip).toBe("203.0.113.1");
    });

    it("should not throw when ACL logging fails", async () => {
      mockAcl.recordAdminAction.mockRejectedValue(new Error("DB error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(
        logAuditAction({ admin: { id: "a1" }, req: {} }, { action: "TEST", target: "test" })
      ).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("withAuditLog", () => {
    it("should call resolver and then log audit action via ACL", async () => {
      mockAcl.recordAdminAction.mockResolvedValue(undefined);
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
      expect(mockAcl.recordAdminAction).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: "result-1" });
    });

    it("should not log when resolver returns null", async () => {
      const mockResolver = jest.fn().mockResolvedValue(null);
      const auditBuilder = jest.fn();

      const wrapped = withAuditLog(mockResolver, auditBuilder);

      const result = await wrapped(null, {}, {});

      expect(result).toBeNull();
      expect(auditBuilder).not.toHaveBeenCalled();
      expect(mockAcl.recordAdminAction).not.toHaveBeenCalled();
    });

    it("should not log when resolver returns undefined", async () => {
      const mockResolver = jest.fn().mockResolvedValue(undefined);
      const auditBuilder = jest.fn();

      const wrapped = withAuditLog(mockResolver, auditBuilder);

      const result = await wrapped(null, {}, {});

      expect(result).toBeUndefined();
      expect(auditBuilder).not.toHaveBeenCalled();
      expect(mockAcl.recordAdminAction).not.toHaveBeenCalled();
    });
  });
});
