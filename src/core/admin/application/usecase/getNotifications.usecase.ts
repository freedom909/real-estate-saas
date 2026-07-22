// src/core/admin/application/usecase/getNotifications.usecase.ts

import { injectable, inject } from "tsyringe";
import { INotificationRepository } from "../../domain/entities/INotificationRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class GetNotificationsUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.notificationRepository)
    private notificationRepo: INotificationRepository
  ) {}

  async execute(adminId: string, limit: number = 50) {
    const notifications = await this.notificationRepo.findByAdminId(adminId, limit);
    const unreadCount = await this.notificationRepo.countUnread(adminId);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        adminId: n.adminId,
        type: n.type,
        title: n.title,
        message: n.message,
        target: n.target,
        targetId: n.targetId,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  }
}
