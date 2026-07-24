// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockSettingsRepo = {
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  upsert: jest.fn(),
  deleteByKey: jest.fn(),
};

jest.mock("tsyringe", () => ({
  injectable: () => (target: any) => target,
  inject: () => () => {},
  container: { resolve: jest.fn(() => mockSettingsRepo) },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { systemSettingsRepository: Symbol.for("SystemSettingsRepository") },
  },
}));

import GetSystemSettingsUseCase from "@/core/admin/application/usecase/getSystemSettings.usecase";

describe("GetSystemSettingsUseCase", () => {
  let useCase: GetSystemSettingsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetSystemSettingsUseCase as any)(mockSettingsRepo);
  });

  it("should return all settings when no category", async () => {
    const settings = [
      { id: "s1", key: "site.name", value: "Minshuku", category: "general", updatedAt: new Date(), createdAt: new Date() },
    ];
    mockSettingsRepo.findAll.mockResolvedValue(settings);

    const result = await useCase.execute();

    expect(mockSettingsRepo.findAll).toHaveBeenCalled();
    expect(mockSettingsRepo.findByCategory).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("site.name");
  });

  it("should return settings by category", async () => {
    mockSettingsRepo.findByCategory.mockResolvedValue([]);

    await useCase.execute("security");

    expect(mockSettingsRepo.findByCategory).toHaveBeenCalledWith("security");
    expect(mockSettingsRepo.findAll).not.toHaveBeenCalled();
  });

  it("should map all fields correctly", async () => {
    const now = new Date();
    const setting = {
      id: "s1",
      key: "smtp.host",
      value: "smtp.example.com",
      category: "email",
      description: "SMTP server",
      updatedBy: "admin-1",
      updatedAt: now,
      createdAt: now,
    };
    mockSettingsRepo.findAll.mockResolvedValue([setting]);

    const result = await useCase.execute();

    expect(result[0]).toEqual({
      id: "s1",
      key: "smtp.host",
      value: "smtp.example.com",
      category: "email",
      description: "SMTP server",
      updatedBy: "admin-1",
      updatedAt: now,
      createdAt: now,
    });
  });
});
