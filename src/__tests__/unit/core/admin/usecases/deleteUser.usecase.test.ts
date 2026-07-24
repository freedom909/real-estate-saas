// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByRole: jest.fn(),
};

jest.mock("tsyringe", () => ({
  injectable: () => (target: any) => target,
  inject: () => () => {},
  container: { resolve: jest.fn(() => mockAdminRepo) },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { adminUserRepository: Symbol.for("AdminUserRepository") },
  },
}));

jest.mock("@/core/admin/domain/entities/adminRole", () => ({
  AdminRole: { SUPER_ADMIN: "SUPER_ADMIN" },
}));

import DeleteAdminUserUseCase from "@/core/admin/application/usecase/deleteUser.usecase";

describe("DeleteAdminUserUseCase", () => {
  let useCase: DeleteAdminUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (DeleteAdminUserUseCase as any)(mockAdminRepo);
  });

  it("should delete admin user successfully", async () => {
    mockAdminRepo.findById.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      immutable: false,
    });
    mockAdminRepo.delete.mockResolvedValue(true);

    const result = await useCase.execute("a1");

    expect(mockAdminRepo.findById).toHaveBeenCalledWith("a1");
    expect(mockAdminRepo.delete).toHaveBeenCalledWith("a1");
    expect(result).toBe(true);
  });

  it("should throw when admin not found", async () => {
    mockAdminRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toThrow("Admin not found");
  });

  it("should throw when admin is immutable", async () => {
    mockAdminRepo.findById.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      immutable: true,
    });

    await expect(useCase.execute("a1")).rejects.toThrow("System account cannot be deleted.");
  });

  it("should throw when deleting the last SUPER_ADMIN", async () => {
    mockAdminRepo.findById.mockResolvedValue({
      id: "a1",
      role: "SUPER_ADMIN",
      immutable: false,
    });
    mockAdminRepo.countByRole.mockResolvedValue(1);

    await expect(useCase.execute("a1")).rejects.toThrow("Cannot delete the last Super Admin.");
  });

  it("should allow deleting a SUPER_ADMIN when others exist", async () => {
    mockAdminRepo.findById.mockResolvedValue({
      id: "a1",
      role: "SUPER_ADMIN",
      immutable: false,
    });
    mockAdminRepo.countByRole.mockResolvedValue(3);
    mockAdminRepo.delete.mockResolvedValue(true);

    const result = await useCase.execute("a1");

    expect(result).toBe(true);
  });
});
