// src/modules/container/admin.register.ts

import { container } from "tsyringe";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

import AdminUserModel from "@/core/admin/infrastructure/models/adminUser.model";
import AuditLogModel from "@/core/admin/infrastructure/models/auditLog.model";
import SystemSettingsModel from "@/core/admin/infrastructure/models/systemSettings.model";
import NotificationModel from "@/core/admin/infrastructure/models/notification.model";
import { AdminUserRepository } from "@/core/admin/infrastructure/persistence/adminUser.repository";
import { AuditLogRepository } from "@/core/admin/infrastructure/persistence/auditLog.repository";
import { SystemSettingsRepository } from "@/core/admin/infrastructure/persistence/systemSettings.repository";
import { NotificationRepository } from "@/core/admin/infrastructure/persistence/notification.repository";
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
import UpdateProfileUseCase from "@/core/admin/application/usecase/updateAdminAccount.usecase";

import UpdateAdminAccountUseCase from "@/core/admin/application/usecase/updateAdminAccount.usecase";

export default function registerAdminDependencies() {
  // Models
  container.register(TOKENS_ADMIN.models.adminUserModel, {
    useValue: AdminUserModel,
  });

  container.register(TOKENS_ADMIN.models.auditLogModel, {
    useValue: AuditLogModel,
  });

  container.register(TOKENS_ADMIN.models.systemSettingsModel, {
    useValue: SystemSettingsModel,
  });

  container.register(TOKENS_ADMIN.models.notificationModel, {
    useValue: NotificationModel,
  });

  // Repositories
  container.register(TOKENS_ADMIN.repos.adminUserRepository, {
    useClass: AdminUserRepository,
  });

  container.register(TOKENS_ADMIN.repos.auditLogRepository, {
    useClass: AuditLogRepository,
  });

  container.register(TOKENS_ADMIN.repos.systemSettingsRepository, {
    useClass: SystemSettingsRepository,
  });

  container.register(TOKENS_ADMIN.repos.notificationRepository, {
    useClass: NotificationRepository,
  });

  // Use Cases
  container.register(TOKENS_ADMIN.usecase.createAdminUserUseCase, {
    useClass: CreateAdminUserUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getAdminUserByIdUseCase, {
    useClass: GetAdminUserByIdUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.updateAdminUserUseCase, {
    useClass: UpdateAdminUserUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.deleteAdminUserUseCase, {
    useClass: DeleteAdminUserUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.createAuditLogUseCase, {
    useClass: CreateAuditLogUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getAuditLogsUseCase, {
    useClass: GetAuditLogsUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getAuditLogCountUseCase, {
    useClass: GetAuditLogCountUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getDashboardStatsUseCase, {
    useClass: GetDashboardStatsUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getSystemSettingsUseCase, {
    useClass: GetSystemSettingsUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.updateSystemSettingUseCase, {
    useClass: UpdateSystemSettingUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.deleteSystemSettingUseCase, {
    useClass: DeleteSystemSettingUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.getNotificationsUseCase, {
    useClass: GetNotificationsUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.createNotificationUseCase, {
    useClass: CreateNotificationUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.markNotificationReadUseCase, {
    useClass: MarkNotificationReadUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.deleteNotificationUseCase, {
    useClass: DeleteNotificationUseCase,
  });

  container.register(TOKENS_ADMIN.usecase.updateAdminAccountUseCase, {
    useClass: UpdateAdminAccountUseCase,
  });


}
