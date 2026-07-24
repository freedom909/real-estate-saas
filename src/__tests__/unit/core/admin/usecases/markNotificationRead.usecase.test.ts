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

import MarkNotificationReadUseCase from "@/core/admin/application/usecase/markNotificationRead.usecase";

describe("MarkNotificationReadUseCase", () => {
  let useCase: MarkNotificationReadUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (MarkNotificationReadUseCase as any)(mockNotificationRepo);
  });

  describe("markOne", () => {
    it("should mark one notification as read", async () => {
      mockNotificationRepo.markAsRead.mockResolvedValue(true);

      const result = await useCase.markOne("n1");

      expect(mockNotificationRepo.markAsRead).toHaveBeenCalledWith("n1");
      expect(result).toBe(true);
    });

    it("should return false when notification not found", async () => {
      mockNotificationRepo.markAsRead.mockResolvedValue(false);

      const result = await useCase.markOne("missing");

      expect(result).toBe(false);
    });
  });

  describe("markAll", () => {
    it("should mark all notifications as read for admin", async () => {
      mockNotificationRepo.markAllAsRead.mockResolvedValue(true);

      const result = await useCase.markAll("a1");

      expect(mockNotificationRepo.markAllAsRead).toHaveBeenCalledWith("a1");
      expect(result).toBe(true);
    });

    it("should return false when no notifications to mark", async () => {
      mockNotificationRepo.markAllAsRead.mockResolvedValue(false);

      const result = await useCase.markAll("a1");

      expect(result).toBe(false);
    });
  });
});
