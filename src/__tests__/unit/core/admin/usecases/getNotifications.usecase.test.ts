// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockNotificationRepo = {
  findByAdminId: jest.fn(),
  countUnread: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  create: jest.fn(),
};

jest.mock("tsyringe", () => ({
  injectable: () => (target: any) => target,
  inject: () => () => {},
  container: { resolve: jest.fn(() => mockNotificationRepo) },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { notificationRepository: Symbol.for("NotificationRepository") },
  },
}));

import GetNotificationsUseCase from "@/core/admin/application/usecase/getNotifications.usecase";

describe("GetNotificationsUseCase", () => {
  let useCase: GetNotificationsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetNotificationsUseCase as any)(mockNotificationRepo);
  });

  it("should return notifications with unread count", async () => {
    const notifications = [
      { id: "n1", adminId: "a1", type: "INFO", title: "T1", message: "M1", isRead: false, createdAt: new Date() },
      { id: "n2", adminId: "a1", type: "WARNING", title: "T2", message: "M2", isRead: true, createdAt: new Date() },
    ];
    mockNotificationRepo.findByAdminId.mockResolvedValue(notifications);
    mockNotificationRepo.countUnread.mockResolvedValue(1);

    const result = await useCase.execute("a1", 10);

    expect(mockNotificationRepo.findByAdminId).toHaveBeenCalledWith("a1", 10);
    expect(mockNotificationRepo.countUnread).toHaveBeenCalledWith("a1");
    expect(result.notifications).toHaveLength(2);
    expect(result.unreadCount).toBe(1);
  });

  it("should use default limit of 50", async () => {
    mockNotificationRepo.findByAdminId.mockResolvedValue([]);
    mockNotificationRepo.countUnread.mockResolvedValue(0);

    await useCase.execute("a1");

    expect(mockNotificationRepo.findByAdminId).toHaveBeenCalledWith("a1", 50);
  });

  it("should return empty notifications when none exist", async () => {
    mockNotificationRepo.findByAdminId.mockResolvedValue([]);
    mockNotificationRepo.countUnread.mockResolvedValue(0);

    const result = await useCase.execute("a1");

    expect(result.notifications).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });
});
