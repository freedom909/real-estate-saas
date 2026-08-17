// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  promoteUserToAdmin: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  createAdmin: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByRole: jest.fn(),
  findByEmail: jest.fn(),
};

const mockUserRepo = {
  findById: jest.fn(),
  setUserRole: jest.fn(),
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

jest.mock("@/modules/tokens/user.tokens", () => ({
  TOKENS_USER: {
    repos: { userRepository: Symbol.for("UserRepository") },
  },
}));

jest.mock("@/core/admin/domain/entities/adminUser", () => ({
  AdminUser: {
    fromUser: jest.fn((user) => ({ id: user.id, email: user.email, role: "ADMIN", name: user.name })),
  },
}));

import PromoteUserToAdminUseCase from "@/core/admin/application/usecase/promoteUserToAdmin.usecase";

describe("PromoteUserToAdminUseCase", () => {
  let useCase: PromoteUserToAdminUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (PromoteUserToAdminUseCase as any)(mockAdminRepo, mockUserRepo);
  });

  it("should find user, set role, and create admin", async () => {
    const mockUser = { id: "user-123", email: "user@test.com", name: "Test User" };
    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockUserRepo.setUserRole.mockResolvedValue(undefined);
    mockAdminRepo.createAdmin.mockResolvedValue(undefined);

    await useCase.execute("user-123");

    expect(mockUserRepo.findById).toHaveBeenCalledWith("user-123");
    expect(mockUserRepo.setUserRole).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(mockAdminRepo.createAdmin).toHaveBeenCalled();
  });

  it("should throw when user not found", async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute("missing-user")).rejects.toThrow("User not found");
  });

  it("should propagate errors from the repository", async () => {
    mockUserRepo.findById.mockRejectedValue(new Error("Connection refused"));

    await expect(useCase.execute("user-123")).rejects.toThrow("Connection refused");
  });
});
