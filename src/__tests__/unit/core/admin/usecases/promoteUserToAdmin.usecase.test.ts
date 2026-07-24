// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  promoteUserToAdmin: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByRole: jest.fn(),
  findByEmail: jest.fn(),
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

import PromoteUserToAdminUseCase from "@/core/admin/application/usecase/promoteUserToAdmin.usecase";

describe("PromoteUserToAdminUseCase", () => {
  let useCase: PromoteUserToAdminUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (PromoteUserToAdminUseCase as any)(mockAdminRepo);
  });

  it("should call repo.promoteUserToAdmin with the given userId", async () => {
    mockAdminRepo.promoteUserToAdmin.mockResolvedValue(undefined);

    await useCase.execute("user-123");

    expect(mockAdminRepo.promoteUserToAdmin).toHaveBeenCalledWith("user-123");
  });

  it("should return void", async () => {
    mockAdminRepo.promoteUserToAdmin.mockResolvedValue(undefined);

    const result = await useCase.execute("user-123");

    expect(result).toBeUndefined();
  });

  it("should propagate errors from the repository", async () => {
    mockAdminRepo.promoteUserToAdmin.mockRejectedValue(
      new Error("User not found")
    );

    await expect(useCase.execute("missing-user")).rejects.toThrow(
      "User not found"
    );
  });

  it("should forward an empty string userId without validation", async () => {
    mockAdminRepo.promoteUserToAdmin.mockResolvedValue(undefined);

    await useCase.execute("");

    expect(mockAdminRepo.promoteUserToAdmin).toHaveBeenCalledWith("");
  });
});
