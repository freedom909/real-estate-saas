// src/subgraphs/admin/resolvers/admin.resolver.ts

import { container } from "tsyringe";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

import CreateAdminUserUseCase from "@/core/admin/application/usecase/createAdminUser.usecase";
import GetAdminUserByIdUseCase from "@/core/admin/application/usecase/getAdminUserById.usecase";
import UpdateAdminUserUseCase from "@/core/admin/application/usecase/updateAdminUser.usecase";
import DeleteAdminUserUseCase from "@/core/admin/application/usecase/deleteAdminUser.usecase";
import CreateAuditLogUseCase from "@/core/admin/application/usecase/createAuditLog.usecase";
import GetAuditLogsUseCase from "@/core/admin/application/usecase/getAuditLogs.usecase";
import GetAuditLogCountUseCase from "@/core/admin/application/usecase/getAuditLogCount.usecase";
import GetDashboardStatsUseCase from "@/core/admin/application/usecase/getDashboardStats.usecase";
import GetSystemSettingsUseCase from "@/core/admin/application/usecase/getSystemSettings.usecase";
import UpdateSystemSettingUseCase from "@/core/admin/application/usecase/updateSystemSetting.usecase";
import DeleteSystemSettingUseCase from "@/core/admin/application/usecase/deleteSystemSetting.usecase";
import GetNotificationsUseCase from "@/core/admin/application/usecase/getNotifications.usecase";
import CreateNotificationUseCase from "@/core/admin/application/usecase/createNotification.usecase";
import MarkNotificationReadUseCase from "@/core/admin/application/usecase/markNotificationRead.usecase";
import DeleteNotificationUseCase from "@/core/admin/application/usecase/deleteNotification.usecase";

import { IAdminUserRepository } from "@/core/admin/domain/entities/IAdminUserRepository";
import { IAuditLogRepository } from "@/core/admin/domain/entities/IAuditLogRepository";
import { requireAdminRole, requirePermission } from "../guards/adminRole.guard";
import { Permission, getPermissions } from "../guards/adminPermissions";
import { logAuditAction, withAuditLog } from "../guards/auditLogger";
import UpdateAdminAccountUseCase from "@/core/admin/application/usecase/updateAdminAccount.usecase";

// Helper: wrap resolver with permission guard
function withPermission(resolver: Function, permission: Permission) {
  return async (parent: any, args: any, context: any, info: any) => {
    const guard = requirePermission(permission);
    await guard(parent, args, context, () => {});
    return resolver(parent, args, context, info);
  };
}

// Helper: wrap resolver with role guard (legacy support)
function withRole(resolver: Function, minRole: "ADMIN" | "SUPER_ADMIN" | "MODERATOR" = "ADMIN") {
  return async (parent: any, args: any, context: any, info: any) => {
    const guard = requireAdminRole(minRole);
    await guard(parent, args, context, () => {});
    return resolver(parent, args, context, info);
  };
}

export const resolvers = {
  Query: {
    // Dashboard
    adminDashboard: withPermission(async () => {
      const auditRepo = container.resolve<IAuditLogRepository>(
        TOKENS_ADMIN.repos.auditLogRepository
      );
      const recentLogs = await auditRepo.findAll(10);
      return {
        totalUsers: 0,
        totalListings: 0,
        totalBookings: 0,
        recentAuditLogs: recentLogs.map((l) => ({
          id: l.id,
          adminId: l.adminId,
          action: l.action,
          target: l.target,
          targetId: l.targetId,
          details: l.details,
          ip: l.ip,
          createdAt: l.createdAt,
        })),
      };
    }, "dashboard:view"),

    dashboardStats: withPermission(async () => {
      const useCase = container.resolve<GetDashboardStatsUseCase>(
        TOKENS_ADMIN.usecase.getDashboardStatsUseCase
      );
      return useCase.execute();
    }, "dashboard:view"),

    // Admin Users
    adminUsers: withPermission(async () => {
      const repo = container.resolve<IAdminUserRepository>(
        TOKENS_ADMIN.repos.adminUserRepository
      );
      return repo.findAll();
    }, "admin_users:view"),

    adminUser: withPermission(async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetAdminUserByIdUseCase>(
        TOKENS_ADMIN.usecase.getAdminUserByIdUseCase
      );
      return useCase.execute(id);
    }, "admin_users:view"),

    // Audit Logs
    adminAuditLogs: withPermission(async (_: any, { limit, filter }: { limit?: number; filter?: any }) => {
      const useCase = container.resolve<GetAuditLogsUseCase>(
        TOKENS_ADMIN.usecase.getAuditLogsUseCase
      );
      return useCase.execute(limit, filter);
    }, "audit_logs:view"),

    adminAuditLogCount: withPermission(async (_: any, { filter }: { filter?: any }) => {
      const useCase = container.resolve<GetAuditLogCountUseCase>(
        TOKENS_ADMIN.usecase.getAuditLogCountUseCase
      );
      return useCase.execute(filter);
    }, "audit_logs:view"),

    // Settings
    systemSettings: withPermission(async (_: any, { category }: { category?: string }) => {
      const useCase = container.resolve<GetSystemSettingsUseCase>(
        TOKENS_ADMIN.usecase.getSystemSettingsUseCase
      );
      return useCase.execute(category);
    }, "settings:view"),

    myPermissions: withPermission(async (_: any, __: any, context: any) => {
      const adminRepo = container.resolve<IAdminUserRepository>(
        TOKENS_ADMIN.repos.adminUserRepository
      );
      const admin = await adminRepo.findById(context.user.userId);
      if (!admin) throw new Error("Admin not found");
      const role = (admin as any).role;
      return {
        role,
        permissions: getPermissions(role),
      };
    }, "profile:view"),

    notifications: withPermission(async (_: any, { limit }: { limit?: number }, context: any) => {
      const useCase = container.resolve<GetNotificationsUseCase>(
        TOKENS_ADMIN.usecase.getNotificationsUseCase
      );
      return useCase.execute(context.user.userId, limit);
    }, "dashboard:view"),

    unreadNotificationCount: withPermission(async (_: any, __: any, context: any) => {
      const useCase = container.resolve<GetNotificationsUseCase>(
        TOKENS_ADMIN.usecase.getNotificationsUseCase
      );
      const result = await useCase.execute(context.user.userId, 0);
      return result.unreadCount;
    }, "dashboard:view"),
  },

  Mutation: {
    // Admin Users — with audit logging
    createAdminUser: withPermission(withAuditLog(
      async (_: any, { input }: any) => {
        const useCase = container.resolve<CreateAdminUserUseCase>(
          TOKENS_ADMIN.usecase.createAdminUserUseCase
        );
        return useCase.execute(input);
      },
      (result, args) => ({
        action: "CREATE_ADMIN_USER",
        target: "admin_user",
        targetId: result?.id,
        details: `Created admin: ${args.input.email} (${args.input.role || "ADMIN"})`,
      })
    ), "admin_users:create"),

    updateAdminUser: withPermission(withAuditLog(
      async (_: any, { id, input }: any) => {
        const useCase = container.resolve<UpdateAdminUserUseCase>(
          TOKENS_ADMIN.usecase.updateAdminUserUseCase
        );
        return useCase.execute(id, input);
      },
      (result, args) => ({
        action: "UPDATE_ADMIN_USER",
        target: "admin_user",
        targetId: args.id,
        details: `Updated admin: ${JSON.stringify(args.input)}`,
      })
    ), "admin_users:update"),

    deleteAdminUser: withPermission(withAuditLog(
      async (_: any, { id }: { id: string }) => {
        const useCase = container.resolve<DeleteAdminUserUseCase>(
          TOKENS_ADMIN.usecase.deleteAdminUserUseCase
        );
        return useCase.execute(id);
      },
      (_result, args) => ({
        action: "DELETE_ADMIN_USER",
        target: "admin_user",
        targetId: args.id,
        details: `Deleted admin: ${args.id}`,
      })
    ), "admin_users:delete"),

    // Audit Logs
    createAdminAuditLog: withPermission(async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateAuditLogUseCase>(
        TOKENS_ADMIN.usecase.createAuditLogUseCase
      );
      return useCase.execute(input);
    }, "audit_logs:create"),

    // Profile — with audit logging
    updateAdminAccount: withPermission(withAuditLog(
      async (_: any, { input }: any, context: any) => {
        const useCase = container.resolve<UpdateAdminAccountUseCase>(
          TOKENS_ADMIN.usecase.updateAdminAccountUseCase
        );
        return useCase.execute(context.user.userId, input);
      },
      (result, _args, context) => ({
        action: "UPDATE_PROFILE",
        target: "admin_user",
        targetId: context.user.userId,
        details: `Updated profile: ${JSON.stringify(_args.input)}`,
      })
    ), "profile:update"),

    // Settings — with audit logging
    updateSystemSetting: withPermission(withAuditLog(
      async (_: any, { input }: any, context: any) => {
        const useCase = container.resolve<UpdateSystemSettingUseCase>(
          TOKENS_ADMIN.usecase.updateSystemSettingUseCase
        );
        return useCase.execute({ ...input, updatedBy: context.user.userId });
      },
      (result, args) => ({
        action: "UPDATE_SYSTEM_SETTING",
        target: "system_setting",
        targetId: args.input.key,
        details: `Updated setting: ${args.input.key} = ${args.input.value}`,
      })
    ), "settings:update"),

    deleteSystemSetting: withPermission(withAuditLog(
      async (_: any, { key }: { key: string }) => {
        const useCase = container.resolve<DeleteSystemSettingUseCase>(
          TOKENS_ADMIN.usecase.deleteSystemSettingUseCase
        );
        return useCase.execute(key);
      },
      (_result, args) => ({
        action: "DELETE_SYSTEM_SETTING",
        target: "system_setting",
        targetId: args.key,
        details: `Deleted setting: ${args.key}`,
      })
    ), "settings:delete"),

    // Notifications
    createNotification: withPermission(async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateNotificationUseCase>(
        TOKENS_ADMIN.usecase.createNotificationUseCase
      );
      return useCase.execute(input);
    }, "admin_users:create"),

    markNotificationRead: withPermission(async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<MarkNotificationReadUseCase>(
        TOKENS_ADMIN.usecase.markNotificationReadUseCase
      );
      return useCase.markOne(id);
    }, "dashboard:view"),

    markAllNotificationsRead: withPermission(async (_: any, __: any, context: any) => {
      const useCase = container.resolve<MarkNotificationReadUseCase>(
        TOKENS_ADMIN.usecase.markNotificationReadUseCase
      );
      return useCase.markAll(context.user.userId);
    }, "dashboard:view"),

    deleteNotification: withPermission(async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<DeleteNotificationUseCase>(
        TOKENS_ADMIN.usecase.deleteNotificationUseCase
      );
      return useCase.execute(id);
    }, "dashboard:view"),
  },
};
