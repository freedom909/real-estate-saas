// src/core/admin/application/usecase/deleteNotification.usecase.ts

import { injectable, inject } from "tsyringe";
import { INotificationRepository } from "../../domain/entities/INotificationRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class DeleteNotificationUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.notificationRepository)
    private notificationRepo: INotificationRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return this.notificationRepo.delete(id);
  }
}
