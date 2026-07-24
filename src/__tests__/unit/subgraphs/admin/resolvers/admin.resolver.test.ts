// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ── Mock all imported use-cases & repos before touching the resolver ──────────
const mockUseCases = {
  createAdminUser: { execute: jest.fn() },
  getAdminUserById: { execute: jest.fn() },
  updateAdminUser: { execute: jest.fn() },
  deleteAdminUser: { execute: jest.fn() },
  createAuditLog: { execute: jest.fn() },
  getAuditLogs: { execute: jest.fn() },
  getAuditLogCount: { execute: jest.fn() },
  getDashboardStats: { execute: jest.fn() },
  getSystemSettings: { execute: jest.fn() },
  updateSystemSetting: { execute: jest.fn() },
  deleteSystemSetting: { execute: jest.fn() },
  getNotifications: { execute: jest.fn(), markOne: jest.fn(), markAll: jest.fn() },
  createNotification: { execute: jest.fn() },
  markNotificationRead: { markOne: jest.fn(), markAll: jest.fn() },
  deleteNotification: { execute: jest.fn() },
  updateAdminAccount: { execute: jest.fn() },
};

const mockRepos = {
  adminUser: { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), countByRole: jest.fn() },
  auditLog: { findAll: jest.fn(), findFiltered: jest.fn(), create: jest.fn() },
};

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

// Mock use-case classes so `container.resolve(token)` returns our mocks
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
jest.mock("@/core/admin/application/usecase/getAuditLogCount.usecase", () => ({ __esModule: true, default: function () {} }));

// Mock guards – pass-through so resolver body runs unguarded
jest.mock("@/subgraphs/admin/guards/adminRole.guard", () => ({
  requireAdminRole: jest.fn(() => async (_p: any, _a: any, _c: any, next: Function) => next()),
  requirePermission: jest.fn(() => async (_p: any, _a: any, _c: any, next: Function) => next()),
}));

jest.mock("@/subgraphs/admin/guards/adminPermissions", () => ({
  Permission: {},
  getPermissions: jest.fn(() => ["dashboard:view", "admin_users:view", "admin_users:create", "admin_users:update", "admin_users:delete", "audit_logs:view", "audit_logs:create", "settings:view", "settings:update", "settings:delete", "profile:view", "profile:update"]),
}));

jest.mock("@/subgraphs/admin/guards/auditLogger", () => ({
  logAuditAction: jest.fn(),
  withAuditLog: jest.fn((resolver: Function) => resolver),
}));

// Mock tsyringe container – return the correct mock based on symbol
jest.mock("tsyringe", () => {
  const tokenMap = new Map<symbol, any>([
    [Symbol.for("AdminUserRepository"), mockRepos.adminUser],
    [Symbol.for("AuditLogRepository"), mockRepos.auditLog],
    [Symbol.for("CreateAdminUserUseCase"), mockUseCases.createAdminUser],
    [Symbol.for("GetAdminUserByIdUseCase"), mockUseCases.getAdminUserById],
    [Symbol.for("UpdateAdminUserUseCase"), mockUseCases.updateAdminUser],
    [Symbol.for("DeleteAdminUserUseCase"), mockUseCases.deleteAdminUser],
    [Symbol.for("CreateAuditLogUseCase"), mockUseCases.createAuditLog],
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

import { resolvers } from "@/subgraphs/admin/resolvers/admin.resolver";

// ── Helpers ──────────────────────────────────────────────────────────────────
const ctx = (userId = "admin-1") => ({
  user: { userId },
  admin: { id: "admin-1", role: "SUPER_ADMIN", email: "admin@test.com", permissions: [] },
  req: { ip: "127.0.0.1", headers: {} },
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("Admin Resolvers", () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Queries ─────────────────────────────────────────────────────────────
  describe("Query.adminDashboard", () => {
    it("should return dashboard with recent audit logs", async () => {
      const logs = [{ id: "log-1", adminId: "a1", action: "CREATE", target: "user", targetId: "u1", details: "ok", ip: "1.1.1.1", createdAt: new Date() }];
      mockRepos.auditLog.findAll.mockResolvedValue(logs);

      const result = await (resolvers as any).Query.adminDashboard(null, {}, ctx());

      expect(mockRepos.auditLog.findAll).toHaveBeenCalledWith(10);
      expect(result.totalUsers).toBe(0);
      expect(result.recentAuditLogs).toHaveLength(1);
      expect(result.recentAuditLogs[0].id).toBe("log-1");
    });
  });

  describe("Query.dashboardStats", () => {
    it("should delegate to GetDashboardStatsUseCase", async () => {
      const stats = { totalUsers: 42, totalListings: 128, totalBookings: 89, activeAdmins: 3, recentActivity: [], userGrowth: [], activityByAction: [], systemHealth: { status: "healthy", uptime: "0m", databaseStatus: "connected", lastChecked: new Date() } };
      mockUseCases.getDashboardStats.execute.mockResolvedValue(stats);

      const result = await (resolvers as any).Query.dashboardStats(null, {}, ctx());

      expect(mockUseCases.getDashboardStats.execute).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe("Query.adminUsers", () => {
    it("should return all admin users from repository", async () => {
      const users = [{ id: "a1", name: "Admin One" }, { id: "a2", name: "Admin Two" }];
      mockRepos.adminUser.findAll.mockResolvedValue(users);

      const result = await (resolvers as any).Query.adminUsers(null, {}, ctx());

      expect(mockRepos.adminUser.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("Query.adminUser", () => {
    it("should return admin user by ID via use case", async () => {
      const user = { id: "a1", name: "Admin One" };
      mockUseCases.getAdminUserById.execute.mockResolvedValue(user);

      const result = await (resolvers as any).Query.adminUser(null, { id: "a1" }, ctx());

      expect(mockUseCases.getAdminUserById.execute).toHaveBeenCalledWith("a1");
      expect(result).toEqual(user);
    });

    it("should return null when not found", async () => {
      mockUseCases.getAdminUserById.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Query.adminUser(null, { id: "missing" }, ctx());

      expect(result).toBeNull();
    });
  });

  describe("Query.adminAuditLogs", () => {
    it("should return logs without filter", async () => {
      const logs = [{ id: "log-1" }];
      mockUseCases.getAuditLogs.execute.mockResolvedValue(logs);

      const result = await (resolvers as any).Query.adminAuditLogs(null, { limit: 25 }, ctx());

      expect(mockUseCases.getAuditLogs.execute).toHaveBeenCalledWith(25, undefined);
      expect(result).toEqual(logs);
    });

    it("should pass filter to use case", async () => {
      mockUseCases.getAuditLogs.execute.mockResolvedValue([]);

      await (resolvers as any).Query.adminAuditLogs(null, { limit: 10, filter: { action: "CREATE" } }, ctx());

      expect(mockUseCases.getAuditLogs.execute).toHaveBeenCalledWith(10, { action: "CREATE" });
    });
  });

  describe("Query.adminAuditLogCount", () => {
    it("should return count via use case", async () => {
      mockUseCases.getAuditLogCount.execute.mockResolvedValue(5);

      const result = await (resolvers as any).Query.adminAuditLogCount(null, { filter: { action: "DELETE" } }, ctx());

      expect(mockUseCases.getAuditLogCount.execute).toHaveBeenCalledWith({ action: "DELETE" });
      expect(result).toBe(5);
    });
  });

  describe("Query.systemSettings", () => {
    it("should return settings for a category", async () => {
      const settings = [{ key: "site.name", value: "Minshuku" }];
      mockUseCases.getSystemSettings.execute.mockResolvedValue(settings);

      const result = await (resolvers as any).Query.systemSettings(null, { category: "general" }, ctx());

      expect(mockUseCases.getSystemSettings.execute).toHaveBeenCalledWith("general");
      expect(result).toEqual(settings);
    });

    it("should return all settings when no category", async () => {
      mockUseCases.getSystemSettings.execute.mockResolvedValue([]);

      await (resolvers as any).Query.systemSettings(null, {}, ctx());

      expect(mockUseCases.getSystemSettings.execute).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Query.myPermissions", () => {
    it("should return role and permissions for current admin", async () => {
      mockRepos.adminUser.findById.mockResolvedValue({ id: "admin-1", role: "SUPER_ADMIN" });

      const result = await (resolvers as any).Query.myPermissions(null, {}, ctx());

      expect(mockRepos.adminUser.findById).toHaveBeenCalledWith("admin-1");
      expect(result.role).toBe("SUPER_ADMIN");
      expect(Array.isArray(result.permissions)).toBe(true);
    });

    it("should throw when admin not found", async () => {
      mockRepos.adminUser.findById.mockResolvedValue(null);

      await expect(
        (resolvers as any).Query.myPermissions(null, {}, ctx("unknown"))
      ).rejects.toThrow("Admin not found");
    });
  });

  describe("Query.notifications", () => {
    it("should return notifications with unread count", async () => {
      const payload = { notifications: [{ id: "n1" }], unreadCount: 2 };
      mockUseCases.getNotifications.execute.mockResolvedValue(payload);

      const result = await (resolvers as any).Query.notifications(null, { limit: 10 }, ctx());

      expect(mockUseCases.getNotifications.execute).toHaveBeenCalledWith("admin-1", 10);
      expect(result).toEqual(payload);
    });
  });

  describe("Query.unreadNotificationCount", () => {
    it("should return unread count", async () => {
      mockUseCases.getNotifications.execute.mockResolvedValue({ notifications: [], unreadCount: 7 });

      const result = await (resolvers as any).Query.unreadNotificationCount(null, {}, ctx());

      expect(result).toBe(7);
    });
  });

  // ─── Mutations ───────────────────────────────────────────────────────────
  describe("Mutation.createAdminUser", () => {
    it("should execute use case with input", async () => {
      const input = { email: "new@test.com", name: "New Admin", role: "ADMIN" };
      const created = { id: "a-new", ...input };
      mockUseCases.createAdminUser.execute.mockResolvedValue(created);

      const result = await (resolvers as any).Mutation.createAdminUser(null, { input }, ctx());

      expect(mockUseCases.createAdminUser.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(created);
    });
  });

  describe("Mutation.updateAdminUser", () => {
    it("should execute use case with id and input", async () => {
      const input = { name: "Updated" };
      const updated = { id: "a1", name: "Updated" };
      mockUseCases.updateAdminUser.execute.mockResolvedValue(updated);

      const result = await (resolvers as any).Mutation.updateAdminUser(null, { id: "a1", input }, ctx());

      expect(mockUseCases.updateAdminUser.execute).toHaveBeenCalledWith("a1", input);
      expect(result).toEqual(updated);
    });
  });

  describe("Mutation.deleteAdminUser", () => {
    it("should execute use case with id", async () => {
      mockUseCases.deleteAdminUser.execute.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.deleteAdminUser(null, { id: "a1" }, ctx());

      expect(mockUseCases.deleteAdminUser.execute).toHaveBeenCalledWith("a1");
      expect(result).toBe(true);
    });
  });

  describe("Mutation.createAdminAuditLog", () => {
    it("should execute use case with input", async () => {
      const input = { adminId: "a1", action: "LOGIN", target: "session" };
      const log = { id: "log-new", ...input };
      mockUseCases.createAuditLog.execute.mockResolvedValue(log);

      const result = await (resolvers as any).Mutation.createAdminAuditLog(null, { input }, ctx());

      expect(mockUseCases.createAuditLog.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(log);
    });
  });

  describe("Mutation.updateAdminAccount", () => {
    it("should update own profile via use case", async () => {
      const input = { name: "My New Name" };
      const updated = { id: "admin-1", name: "My New Name" };
      mockUseCases.updateAdminAccount.execute.mockResolvedValue(updated);

      const result = await (resolvers as any).Mutation.updateAdminAccount(null, { input }, ctx());

      expect(mockUseCases.updateAdminAccount.execute).toHaveBeenCalledWith("admin-1", input);
      expect(result).toEqual(updated);
    });
  });

  describe("Mutation.updateSystemSetting", () => {
    it("should upsert setting via use case", async () => {
      const input = { key: "site.name", value: "New Name" };
      const setting = { id: "s1", key: "site.name", value: "New Name" };
      mockUseCases.updateSystemSetting.execute.mockResolvedValue(setting);

      const result = await (resolvers as any).Mutation.updateSystemSetting(null, { input }, ctx());

      expect(mockUseCases.updateSystemSetting.execute).toHaveBeenCalledWith({ key: "site.name", value: "New Name", updatedBy: "admin-1" });
      expect(result).toEqual(setting);
    });
  });

  describe("Mutation.deleteSystemSetting", () => {
    it("should delete setting by key", async () => {
      mockUseCases.deleteSystemSetting.execute.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.deleteSystemSetting(null, { key: "old.key" }, ctx());

      expect(mockUseCases.deleteSystemSetting.execute).toHaveBeenCalledWith("old.key");
      expect(result).toBe(true);
    });
  });

  describe("Mutation.createNotification", () => {
    it("should create notification via use case", async () => {
      const input = { adminId: "a1", type: "INFO", title: "Test", message: "Hello" };
      const notif = { id: "n-new", ...input };
      mockUseCases.createNotification.execute.mockResolvedValue(notif);

      const result = await (resolvers as any).Mutation.createNotification(null, { input }, ctx());

      expect(mockUseCases.createNotification.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(notif);
    });
  });

  describe("Mutation.markNotificationRead", () => {
    it("should mark one notification as read", async () => {
      mockUseCases.markNotificationRead.markOne.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.markNotificationRead(null, { id: "n1" }, ctx());

      expect(mockUseCases.markNotificationRead.markOne).toHaveBeenCalledWith("n1");
      expect(result).toBe(true);
    });
  });

  describe("Mutation.markAllNotificationsRead", () => {
    it("should mark all notifications as read for current admin", async () => {
      mockUseCases.markNotificationRead.markAll.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.markAllNotificationsRead(null, {}, ctx());

      expect(mockUseCases.markNotificationRead.markAll).toHaveBeenCalledWith("admin-1");
      expect(result).toBe(true);
    });
  });

  describe("Mutation.deleteNotification", () => {
    it("should delete notification by id", async () => {
      mockUseCases.deleteNotification.execute.mockResolvedValue(true);

      const result = await (resolvers as any).Mutation.deleteNotification(null, { id: "n1" }, ctx());

      expect(mockUseCases.deleteNotification.execute).toHaveBeenCalledWith("n1");
      expect(result).toBe(true);
    });
  });
});
