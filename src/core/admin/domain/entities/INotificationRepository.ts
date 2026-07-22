// src/core/admin/domain/entities/INotificationRepository.ts

import { Notification } from "./notification";

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findByAdminId(adminId: string, limit?: number): Promise<Notification[]>;
  countUnread(adminId: string): Promise<number>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(adminId: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
