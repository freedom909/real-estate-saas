// src/modules/tokens/admin.tokens.ts

export const TOKENS_ADMIN = {
  models: {
    adminUserModel: Symbol.for("AdminUserModel"),
    auditLogModel: Symbol.for("AuditLogModel"),
    systemSettingsModel: Symbol.for("SystemSettingsModel"),
    notificationModel: Symbol.for("NotificationModel"),
  },

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
} as const;
