// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  demoteAdminToUser: jest.fn(),
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

import DemoteAdminToUserUseCase from "@/core/admin/application/usecase/demoteAdminToUser.usecase";

describe("DemoteAdminToUserUseCase", () => {
  let useCase: DemoteAdminToUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (DemoteAdminToUserUseCase as any)(mockAdminRepo);
  });

  it("should call repo.demoteAdminToUser with the given userId", async () => {
    mockAdminRepo.demoteAdminToUser.mockResolvedValue(undefined);

    await useCase.execute("admin-456");

    expect(mockAdminRepo.demoteAdminToUser).toHaveBeenCalledWith("admin-456");
  });

  it("should return void", async () => {
    mockAdminRepo.demoteAdminToUser.mockResolvedValue(undefined);

    const result = await useCase.execute("admin-456");

    expect(result).toBeUndefined();
  });

  it("should propagate errors from the repository", async () => {
    mockAdminRepo.demoteAdminToUser.mockRejectedValue(
      new Error("User not found")
    );

    await expect(useCase.execute("missing-user")).rejects.toThrow(
      "User not found"
    );
  });

  it("should forward an empty string userId without validation", async () => {
    mockAdminRepo.demoteAdminToUser.mockResolvedValue(undefined);

    await useCase.execute("");

    expect(mockAdminRepo.demoteAdminToUser).toHaveBeenCalledWith("");
  });
});
