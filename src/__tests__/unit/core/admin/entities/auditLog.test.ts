import { describe, it, expect } from "@jest/globals";
import { AuditLog } from "@/core/admin/domain/entities/auditLog";

describe("AuditLog entity", () => {
  it("should create an audit log with all fields", () => {
    const now = new Date();
    const log = new AuditLog({
      id: "log-1",
      adminId: "admin-1",
      action: "CREATE_ADMIN_USER",
      target: "admin_user",
      targetId: "a-new",
      details: "Created admin: test@test.com",
      ip: "127.0.0.1",
      createdAt: now,
    });

    expect(log.id).toBe("log-1");
    expect(log.adminId).toBe("admin-1");
    expect(log.action).toBe("CREATE_ADMIN_USER");
    expect(log.target).toBe("admin_user");
    expect(log.targetId).toBe("a-new");
    expect(log.details).toBe("Created admin: test@test.com");
    expect(log.ip).toBe("127.0.0.1");
    expect(log.createdAt).toBe(now);
  });

  it("should create an audit log with optional fields undefined", () => {
    const now = new Date();
    const log = new AuditLog({
      id: "log-2",
      adminId: "admin-1",
      action: "LOGIN",
      target: "session",
      createdAt: now,
    });

    expect(log.targetId).toBeUndefined();
    expect(log.details).toBeUndefined();
    expect(log.ip).toBeUndefined();
  });
});
