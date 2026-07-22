// src/core/admin/application/usecase/createNotification.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { Notification } from "../../domain/entities/notification";
import { INotificationRepository } from "../../domain/entities/INotificationRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface CreateNotificationInput {
  adminId: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  target?: string;
  targetId?: string;
}

@injectable()
export default class CreateNotificationUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.notificationRepository)
    private notificationRepo: INotificationRepository
  ) {}

  async execute(input: CreateNotificationInput) {
    const notification = new Notification({
      id: uuidv4(),
      adminId: input.adminId,
      type: input.type,
      title: input.title,
      message: input.message,
      target: input.target,
      targetId: input.targetId,
      isRead: false,
      createdAt: new Date(),
    });

    return this.notificationRepo.create(notification);
  }
}
