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

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-notif-uuid"),
}));

import CreateNotificationUseCase from "@/core/admin/application/usecase/createNotification.usecase";

describe("CreateNotificationUseCase", () => {
  let useCase: CreateNotificationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (CreateNotificationUseCase as any)(mockNotificationRepo);
  });

  it("should create a notification", async () => {
    const input = {
      adminId: "a1",
      type: "INFO" as const,
      title: "Welcome",
      message: "You have been promoted",
    };
    const created = { id: "mock-notif-uuid", ...input, isRead: false, createdAt: new Date() };
    mockNotificationRepo.create.mockResolvedValue(created);

    const result = await useCase.execute(input);

    expect(mockNotificationRepo.create).toHaveBeenCalled();
    expect(result.id).toBe("mock-notif-uuid");
    expect(result.isRead).toBe(false);
  });

  it("should create notification with optional target fields", async () => {
    const input = {
      adminId: "a1",
      type: "WARNING" as const,
      title: "Alert",
      message: "Booking issue",
      target: "booking",
      targetId: "b-1",
    };
    mockNotificationRepo.create.mockResolvedValue({ id: "mock-notif-uuid", ...input, isRead: false, createdAt: new Date() });

    const result = await useCase.execute(input);

    expect(result.target).toBe("booking");
    expect(result.targetId).toBe("b-1");
  });

  it("should set isRead to false by default", async () => {
    const input = {
      adminId: "a1",
      type: "SUCCESS" as const,
      title: "Done",
      message: "Completed",
    };
    mockNotificationRepo.create.mockResolvedValue({ id: "mock-notif-uuid", ...input, isRead: false, createdAt: new Date() });

    const result = await useCase.execute(input);

    expect(result.isRead).toBe(false);
  });
});
