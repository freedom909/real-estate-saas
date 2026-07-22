// src/core/admin/application/usecase/markNotificationRead.usecase.ts

import { injectable, inject } from "tsyringe";
import { INotificationRepository } from "../../domain/entities/INotificationRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class MarkNotificationReadUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.notificationRepository)
    private notificationRepo: INotificationRepository
  ) {}

  async markOne(id: string): Promise<boolean> {
    return this.notificationRepo.markAsRead(id);
  }

  async markAll(adminId: string): Promise<boolean> {
    return this.notificationRepo.markAllAsRead(adminId);
  }
}
