// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockWriteAuditLog = jest.fn();
const mockFindFiltered = jest.fn();
const mockFindAll = jest.fn();
const mockCountFiltered = jest.fn();

jest.mock("tsyringe", () => ({
  injectable: () => (target: any) => target,
  inject: () => () => {},
}));

jest.mock("@/modules/tokens/audit.tokens", () => ({
  TOKENS_AUDIT: {
    services: { auditLogger: Symbol.for("AuditLogger") },
    repos: { auditLogRepository: Symbol.for("AuditLogRepo") },
  },
}));

jest.mock(
  "@/core/audit/application/write/services/audit.logger",
  () => ({
    AuditLogger: jest.fn().mockImplementation(() => ({
      writeAuditLog: mockWriteAuditLog,
    })),
  })
);

import { AdminAuditACL } from "@/core/admin/application/acl/admin.auditACL";

describe("AdminAuditACL", () => {
  let acl: AdminAuditACL;

  beforeEach(() => {
    jest.clearAllMocks();
    const AuditLoggerCtor: any =
      require("@/core/audit/application/write/services/audit.logger").AuditLogger;
    const auditLogger = new AuditLoggerCtor();
    const auditRepo = {
      findFiltered: mockFindFiltered,
      findAll: mockFindAll,
      countFiltered: mockCountFiltered,
    };
    acl = new (AdminAuditACL as any)(auditLogger, auditRepo);
  });

  it("recordAdminAction -> writes via audit AuditLogger using Mongo DTO shape", async () => {
    const created: any = { id: "log-1", action: "CREATE_ADMIN_USER" };
    mockWriteAuditLog.mockResolvedValue(created);

    const result = await acl.recordAdminAction({
      adminId: "admin-1",
      action: "CREATE_ADMIN_USER",
      target: "admin_user",
      targetId: "a-new",
      details: "Created admin: a@b.com",
      ip: "127.0.0.1",
      userAgent: "ua",
    });

    expect(mockWriteAuditLog).toHaveBeenCalledTimes(1);
    const dto = mockWriteAuditLog.mock.calls[0][0];
    expect(dto.userId).toBe("admin-1");
    expect(dto.ownerId).toBe("admin-1");
    expect(dto.resourceType).toBe("ADMIN");
    expect(dto.resourceId).toBe("a-new");
    expect(dto.status).toBe("SUCCESS");
    expect(dto.meta.ip).toBe("127.0.0.1");
    expect(dto.meta.userAgent).toBe("ua");
    expect(dto.meta.reason).toBe("Created admin: a@b.com");
    expect(result.id).toBe("log-1");
    expect(result.adminId).toBe("admin-1");
    expect(result.target).toBe("admin_user");
  });

  it("listAdminAuditLogs -> calls audit repo.findFiltered with resourceType=ADMIN filter and maps to AdminAuditLogView", async () => {
    const rawLogs = [
      {
        id: "l-1",
        userId: "admin-1",
        action: "UPDATE_PROFILE",
        resourceType: "ADMIN",
        resourceId: "u-1",
        createdAt: new Date("2024-06-01"),
        meta: { ip: "1.1.1.1", reason: "Updated name" },
      },
    ];
    mockFindFiltered.mockResolvedValue(rawLogs);

    const list = await acl.listAdminAuditLogs(25, {
      action: "UPDATE_PROFILE",
      adminId: "admin-1",
    });

    expect(mockFindFiltered).toHaveBeenCalledWith(
      {
        resourceType: "ADMIN",
        action: "UPDATE_PROFILE",
        userId: "admin-1",
      },
      { limit: 25, skip: 0 }
    );
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: "l-1",
      adminId: "admin-1",
      action: "UPDATE_PROFILE",
      target: "admin_action",
      targetId: "u-1",
      details: "Updated name",
      ip: "1.1.1.1",
      createdAt: new Date("2024-06-01"),
    });
  });

  it("countAdminAuditLogs -> calls audit repo.countFiltered with resourceType=ADMIN filter", async () => {
    mockCountFiltered.mockResolvedValue(42);

    const count = await acl.countAdminAuditLogs({ action: "LOGIN" });

    expect(mockCountFiltered).toHaveBeenCalledWith({
      resourceType: "ADMIN",
      action: "LOGIN",
    });
    expect(count).toBe(42);
  });

  it("listRecentAdminAuditLogs -> calls audit repo.findAll with limit and maps to view", async () => {
    const rawLogs = [
      {
        id: "recent-1",
        userId: "admin-2",
        action: "DELETE_SYSTEM_SETTING",
        resourceType: "ADMIN",
        resourceId: "key_abc",
        createdAt: new Date("2024-08-01"),
        meta: { ip: "2.2.2.2", reason: "Stale setting" },
      },
    ];
    mockFindAll.mockResolvedValue(rawLogs);

    const list = await acl.listRecentAdminAuditLogs(10);

    expect(mockFindAll).toHaveBeenCalledWith({ limit: 10, skip: 0 });
    expect(list[0]).toEqual({
      id: "recent-1",
      adminId: "admin-2",
      action: "DELETE_SYSTEM_SETTING",
      target: "admin_action",
      targetId: "key_abc",
      details: "Stale setting",
      ip: "2.2.2.2",
      createdAt: new Date("2024-08-01"),
    });
  });
});
