// src/core/admin/infrastructure/persistence/notification.repository.ts

import { injectable, inject } from "tsyringe";
import { NotificationMapper } from "../mappers/notification.mapper";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { INotificationRepository } from "../../domain/entities/INotificationRepository";
import { Notification } from "../../domain/entities/notification";
import NotificationModel from "../models/notification.model";

@injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @inject(TOKENS_ADMIN.models.notificationModel)
    private model: typeof NotificationModel
  ) {}

  async create(notification: Notification): Promise<Notification> {
    const persistence = NotificationMapper.toPersistence(notification);
    const created = await this.model.create(persistence);
    return NotificationMapper.toDomain(created);
  }

  async findByAdminId(adminId: string, limit: number = 50): Promise<Notification[]> {
    const records = await this.model.findAll({
      where: { adminId },
      limit,
      order: [["createdAt", "DESC"]],
    });
    return records.map((r) => NotificationMapper.toDomain(r));
  }

  async countUnread(adminId: string): Promise<number> {
    return this.model.count({
      where: { adminId, isRead: false },
    });
  }

  async markAsRead(id: string): Promise<boolean> {
    const [affectedCount] = await this.model.update(
      { isRead: true },
      { where: { id } }
    );
    return affectedCount > 0;
  }

  async markAllAsRead(adminId: string): Promise<boolean> {
    const [affectedCount] = await this.model.update(
      { isRead: true },
      { where: { adminId, isRead: false } }
    );
    return affectedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.model.destroy({ where: { id } });
    return deletedCount > 0;
  }
}
