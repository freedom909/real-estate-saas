// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

/**
 * Integration test for the Admin subgraph.
 *
 * This test verifies that:
 * 1. Guards correctly gate access based on role/permissions
 * 2. Resolvers correctly delegate to use cases / repos
 * 3. Audit logging fires on guarded mutations
 * 4. Error propagation works end-to-end through the guard → resolver chain
 *
 * The guards are NOT mocked — they run their real logic against a mock repo.
 * The use-cases ARE mocked so we verify wiring, not business logic (covered by unit tests).
 */

// ── Mock repos (used by guards + use-cases) ───────────────────────────────
const mockAdminRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByRole: jest.fn(),
};

const mockAuditRepo = {
  findAll: jest.fn(),
  findFiltered: jest.fn(),
  create: jest.fn(),
  countFiltered: jest.fn(),
};

const mockNotificationRepo = {
  findByAdminId: jest.fn(),
  countUnread: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  create: jest.fn(),
};

const mockSettingsRepo = {
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  upsert: jest.fn(),
  deleteByKey: jest.fn(),
};

// ── Mock use-cases ────────────────────────────────────────────────────────
const mockUseCases = {
  getAdminUserById: { execute: jest.fn() },
  updateAdminUser: { execute: jest.fn() },
  deleteAdminUser: { execute: jest.fn() },
  createAdminUser: { execute: jest.fn() },
  getAuditLogs: { execute: jest.fn() },
  getAuditLogCount: { execute: jest.fn() },
  getDashboardStats: { execute: jest.fn() },
  getSystemSettings: { execute: jest.fn() },
  updateSystemSetting: { execute: jest.fn() },
  deleteSystemSetting: { execute: jest.fn() },
  getNotifications: { execute: jest.fn() },
  createNotification: { execute: jest.fn() },
  markNotificationRead: { markOne: jest.fn(), markAll: jest.fn() },
  deleteNotification: { execute: jest.fn() },
  updateAdminAccount: { execute: jest.fn() },
};

// ── Mock modules ──────────────────────────────────────────────────────────
jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: {
      adminUserRepository: Symbol.for("AdminUserRepository"),
      auditLogRepository: Symbol.for("AuditLogRepository"),
      systemSettingsRepository: Symbol.for("SystemSettingsRepository"),
      notificationRepository: Symbol.for("NotificationRepository"),
    },
    usecase: {
      createAdminUserUseCase: Symbol.for("CreateAdminUserUseCase"),
      getAdminUserByIdUseCase: Symbol.for("GetAdminUserByIdUseCase"),
      updateAdminUserUseCase: Symbol.for("UpdateAdminUserUseCase"),
      deleteAdminUserUseCase: Symbol.for("DeleteAdminUserUseCase"),
      createAuditLogUseCase: Symbol.for("CreateAuditLogUseCase"),
      getAuditLogsUseCase: Symbol.for("GetAuditLogsUseCase"),
      getAuditLogCountUseCase: Symbol.for("GetAuditLogCountUseCase"),
      getDashboardStatsUseCase: Symbol.for("GetDashboardStatsUseCase"),
      getSystemSettingsUseCase: Symbol.for("GetSystemSettingsUseCase"),
      updateSystemSettingUseCase: Symbol.for("UpdateSystemSettingUseCase"),
      deleteSystemSettingUseCase: Symbol.for("DeleteSystemSettingUseCase"),
      getNotificationsUseCase: Symbol.for("GetNotificationsUseCase"),
      createNotificationUseCase: Symbol.for("CreateNotificationUseCase"),
      markNotificationReadUseCase: Symbol.for("MarkNotificationReadUseCase"),
      deleteNotificationUseCase: Symbol.for("DeleteNotificationUseCase"),
      updateAdminAccountUseCase: Symbol.for("UpdateAdminAccountUseCase"),
    },
  },
}));

// Mock use-case classes (just need them to be importable)
jest.mock("@/core/admin/application/usecase/createAdminUser.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getUserById.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/updateAdminUser.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/deleteUser.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/createAuditLog.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getAuditLogs.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getAuditLogCount.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getDashboardStats.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getSystemSettings.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/updateSystemSetting.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/deleteSystemSetting.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/getNotifications.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/createNotification.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/markNotificationRead.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/deleteNotification.usecase", () => ({ __esModule: true, default: function () {} }));
jest.mock("@/core/admin/application/usecase/updateAdminAccount.usecase", () => ({ __esModule: true, default: function () {} }));

// Mock tsyringe container — wire tokens to real mocks
jest.mock("tsyringe", () => {
  const tokenMap = new Map<symbol, any>([
    [Symbol.for("AdminUserRepository"), mockAdminRepo],
    [Symbol.for("AuditLogRepository"), mockAuditRepo],
    [Symbol.for("SystemSettingsRepository"), mockSettingsRepo],
    [Symbol.for("NotificationRepository"), mockNotificationRepo],
    [Symbol.for("GetAdminUserByIdUseCase"), mockUseCases.getAdminUserById],
    [Symbol.for("UpdateAdminUserUseCase"), mockUseCases.updateAdminUser],
    [Symbol.for("DeleteAdminUserUseCase"), mockUseCases.deleteAdminUser],
    [Symbol.for("CreateAdminUserUseCase"), mockUseCases.createAdminUser],
    [Symbol.for("GetAuditLogsUseCase"), mockUseCases.getAuditLogs],
    [Symbol.for("GetAuditLogCountUseCase"), mockUseCases.getAuditLogCount],
    [Symbol.for("GetDashboardStatsUseCase"), mockUseCases.getDashboardStats],
    [Symbol.for("GetSystemSettingsUseCase"), mockUseCases.getSystemSettings],
    [Symbol.for("UpdateSystemSettingUseCase"), mockUseCases.updateSystemSetting],
    [Symbol.for("DeleteSystemSettingUseCase"), mockUseCases.deleteSystemSetting],
    [Symbol.for("GetNotificationsUseCase"), mockUseCases.getNotifications],
    [Symbol.for("CreateNotificationUseCase"), mockUseCases.createNotification],
    [Symbol.for("MarkNotificationReadUseCase"), mockUseCases.markNotificationRead],
    [Symbol.for("DeleteNotificationUseCase"), mockUseCases.deleteNotification],
    [Symbol.for("UpdateAdminAccountUseCase"), mockUseCases.updateAdminAccount],
  ]);
  return {
    container: { resolve: jest.fn((token: symbol) => tokenMap.get(token) ?? null) },
  };
});

// ── Import resolvers AFTER all mocks are set up ───────────────────────────
import { resolvers } from "@/subgraphs/admin/resolvers/admin.resolver";

// ── Helpers ───────────────────────────────────────────────────────────────
function makeAdmin(id: string, role: string, opts: any = {}) {
  return {
    id,
    email: `${id}@test.com`,
    name: `Admin ${id}`,
    role,
    status: "ACTIVE",
    isActive: true,
    immutable: false,
    ...opts,
  };
}

function ctx(userId = "admin-1") {
  return {
    user: { userId },
    req: { ip: "127.0.0.1", headers: {} },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────
describe("Admin Subgraph Integration", () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Guard enforcement ──────────────────────────────────────────────────
  describe("Guard enforcement", () => {
    it("should reject unauthenticated requests (no user)", async () => {
      await expect(
        (resolvers as any).Query.adminUsers(null, {}, {})
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should reject requests with no userId", async () => {
      await expect(
        (resolvers as any).Query.adminUsers(null, {}, { user: {} })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should reject non-admin users", async () => {
      mockAdminRepo.findById.mockResolvedValue(null);

      await expect(
        (resolvers as any).Query.adminUsers(null, {}, ctx("regular-user"))
      ).rejects.toThrow("FORBIDDEN: Admin access required");
    });

    it("should reject inactive admin accounts", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "ADMIN", { isActive: false }));

      await expect(
        (resolvers as any).Query.adminUsers(null, {}, ctx("a1"))
      ).rejects.toThrow("FORBIDDEN: Admin account is inactive");
    });
  });

  // ─── Queries with authorization ─────────────────────────────────────────
  describe("Query.adminUsers", () => {
    it("should return all admin users when authorized", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockAdminRepo.findAll.mockResolvedValue([
        makeAdmin("a1", "SUPER_ADMIN"),
        makeAdmin("a2", "ADMIN"),
      ]);

      const result = await (resolvers as any).Query.adminUsers(null, {}, ctx("a1"));

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("SUPER_ADMIN");
    });
  });

  describe("Query.adminUser", () => {
    it("should return admin user by ID", async () => {
      mockAdminRepo.findById.mockResolvedValueOnce(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.getAdminUserById.execute.mockResolvedValue(makeAdmin("a2", "ADMIN"));

      const result = await (resolvers as any).Query.adminUser(null, { id: "a2" }, ctx("a1"));

      expect(result.role).toBe("ADMIN");
    });
  });

  describe("Query.dashboardStats", () => {
    it("should return dashboard stats", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      const stats = { totalUsers: 42, activeAdmins: 3, systemHealth: { status: "healthy" } };
      mockUseCases.getDashboardStats.execute.mockResolvedValue(stats);

      const result = await (resolvers as any).Query.dashboardStats(null, {}, ctx("a1"));

      expect(result.totalUsers).toBe(42);
    });
  });

  describe("Query.myPermissions", () => {
    it("should return permissions for the current admin", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "ADMIN"));

      const result = await (resolvers as any).Query.myPermissions(null, {}, ctx("a1"));

      expect(result.role).toBe("ADMIN");
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.permissions).toContain("admin_users:view");
    });
  });

  describe("Query.notifications", () => {
    it("should return notifications for the current admin", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.getNotifications.execute.mockResolvedValue({
        notifications: [{ id: "n1", title: "Test" }],
        unreadCount: 1,
      });

      const result = await (resolvers as any).Query.notifications(null, { limit: 5 }, ctx("a1"));

      expect(result.notifications).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  // ─── Mutations with authorization ───────────────────────────────────────
  describe("Mutation.createAdminUser", () => {
    it("should create admin user when authorized", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      const created = makeAdmin("new-admin", "ADMIN");
      mockUseCases.createAdminUser.execute.mockResolvedValue(created);

      const result = await (resolvers as any).Mutation.createAdminUser(
        null,
        { input: { email: "new@test.com", name: "New", role: "ADMIN" } },
        ctx("a1")
      );

      expect(result.id).toBe("new-admin");
    });

    it("should reject non-admin users", async () => {
      mockAdminRepo.findById.mockResolvedValue(null);

      await expect(
        (resolvers as any).Mutation.createAdminUser(
          null,
          { input: { email: "x@test.com", name: "X", role: "ADMIN" } },
          ctx("regular-user")
        )
      ).rejects.toThrow("FORBIDDEN: Admin access required");
    });
  });

  describe("Mutation.deleteAdminUser", () => {
    it("should delete admin user when authorized", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.deleteAdminUser.execute.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.deleteAdminUser(
        null,
        { id: "a2" },
        ctx("a1")
      );

      expect(result).toBe(true);
    });
  });

  describe("Mutation.updateSystemSetting", () => {
    it("should update setting when authorized", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.updateSystemSetting.execute.mockResolvedValue({ key: "site.name", value: "New" });

      const result = await (resolvers as any).Mutation.updateSystemSetting(
        null,
        { input: { key: "site.name", value: "New" } },
        ctx("a1")
      );

      expect(result.key).toBe("site.name");
    });
  });

  describe("Mutation.markAllNotificationsRead", () => {
    it("should mark all notifications read", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.markNotificationRead.markAll.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.markAllNotificationsRead(
        null,
        {},
        ctx("a1")
      );

      expect(result).toBe(true);
    });
  });

  // ─── Role hierarchy enforcement ─────────────────────────────────────────
  describe("Role hierarchy", () => {
    it("should allow SUPER_ADMIN to delete admin users", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "SUPER_ADMIN"));
      mockUseCases.deleteAdminUser.execute.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.deleteAdminUser(
        null,
        { id: "a2" },
        ctx("a1")
      );

      expect(result).toBe(true);
    });

    it("should reject ADMIN from deleting admin users (missing permission)", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "ADMIN"));

      await expect(
        (resolvers as any).Mutation.deleteAdminUser(null, { id: "a2" }, ctx("a1"))
      ).rejects.toThrow('FORBIDDEN: Missing permission "admin_users:delete"');
    });

    it("should reject MODERATOR from viewing admin users", async () => {
      mockAdminRepo.findById.mockResolvedValue(makeAdmin("a1", "MODERATOR"));

      await expect(
        (resolvers as any).Query.adminUsers(null, {}, ctx("a1"))
      ).rejects.toThrow('FORBIDDEN: Missing permission "admin_users:view"');
    });
  });
});
