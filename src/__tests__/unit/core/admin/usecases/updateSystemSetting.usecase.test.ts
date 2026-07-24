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

import UpdateSystemSettingUseCase from "@/core/admin/application/usecase/updateSystemSetting.usecase";

describe("UpdateSystemSettingUseCase", () => {
  let useCase: UpdateSystemSettingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (UpdateSystemSettingUseCase as any)(mockSettingsRepo);
  });

  it("should upsert a setting", async () => {
    const now = new Date();
    const setting = { id: "s1", key: "site.name", value: "New Name", category: "general", updatedAt: now, createdAt: now };
    mockSettingsRepo.upsert.mockResolvedValue(setting);

    const result = await useCase.execute({ key: "site.name", value: "New Name" });

    expect(mockSettingsRepo.upsert).toHaveBeenCalledWith("site.name", "New Name", "general", undefined, undefined);
    expect(result.key).toBe("site.name");
    expect(result.value).toBe("New Name");
  });

  it("should use default category 'general'", async () => {
    const now = new Date();
    mockSettingsRepo.upsert.mockResolvedValue({ id: "s1", key: "k", value: "v", category: "general", updatedAt: now, createdAt: now });

    await useCase.execute({ key: "k", value: "v" });

    expect(mockSettingsRepo.upsert).toHaveBeenCalledWith("k", "v", "general", undefined, undefined);
  });

  it("should pass updatedBy to upsert", async () => {
    const now = new Date();
    mockSettingsRepo.upsert.mockResolvedValue({ id: "s1", key: "k", value: "v", category: "cat", updatedBy: "admin-1", updatedAt: now, createdAt: now });

    const result = await useCase.execute({ key: "k", value: "v", category: "cat", updatedBy: "admin-1" });

    expect(mockSettingsRepo.upsert).toHaveBeenCalledWith("k", "v", "cat", undefined, "admin-1");
    expect(result.updatedBy).toBe("admin-1");
  });

  it("should pass description to upsert", async () => {
    const now = new Date();
    mockSettingsRepo.upsert.mockResolvedValue({ id: "s1", key: "k", value: "v", category: "cat", description: "desc", updatedAt: now, createdAt: now });

    await useCase.execute({ key: "k", value: "v", description: "desc" });

    expect(mockSettingsRepo.upsert).toHaveBeenCalledWith("k", "v", "general", "desc", undefined);
  });
});
