// src/core/admin/infrastructure/mappers/notification.mapper.ts

import { Notification } from "../../domain/entities/notification";

export class NotificationMapper {
  static toDomain(raw: any): Notification {
    return new Notification({
      id: raw.id,
      adminId: raw.adminId,
      type: raw.type,
      title: raw.title,
      message: raw.message,
      target: raw.target,
      targetId: raw.targetId,
      isRead: raw.isRead,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(notification: Notification) {
    return {
      id: notification.id,
      adminId: notification.adminId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      target: notification.target,
      targetId: notification.targetId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
