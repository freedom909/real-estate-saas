// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  countByRole: jest.fn(),
  findByEmail: jest.fn(),
  promoteUserToAdmin: jest.fn(),
  demoteAdminToUser: jest.fn(),
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

import DeleteAdminUseCase from "@/core/admin/application/usecase/deleteAdmin.usecase";

describe("DeleteAdminUseCase", () => {
  let useCase: DeleteAdminUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (DeleteAdminUseCase as any)(mockAdminRepo);
  });

  it("should call repo.delete with the given userId and return true", async () => {
    mockAdminRepo.delete.mockResolvedValue(true);

    const result = await useCase.execute("admin-789");

    expect(mockAdminRepo.delete).toHaveBeenCalledWith("admin-789");
    expect(result).toBe(true);
  });

  it("should return false when repo.delete returns false", async () => {
    mockAdminRepo.delete.mockResolvedValue(false);

    const result = await useCase.execute("nonexistent-id");

    expect(mockAdminRepo.delete).toHaveBeenCalledWith("nonexistent-id");
    expect(result).toBe(false);
  });

  it("should propagate errors from the repository", async () => {
    mockAdminRepo.delete.mockRejectedValue(new Error("Database error"));

    await expect(useCase.execute("admin-789")).rejects.toThrow(
      "Database error"
    );
  });

  it("should forward an empty string userId without validation", async () => {
    mockAdminRepo.delete.mockResolvedValue(false);

    const result = await useCase.execute("");

    expect(mockAdminRepo.delete).toHaveBeenCalledWith("");
    expect(result).toBe(false);
  });
});
