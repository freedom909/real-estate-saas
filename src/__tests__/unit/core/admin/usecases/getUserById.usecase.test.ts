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

import GetAdminUserByIdUseCase from "@/core/admin/application/usecase/getUserById.usecase";

describe("GetAdminUserByIdUseCase", () => {
  let useCase: GetAdminUserByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetAdminUserByIdUseCase as any)(mockAdminRepo);
  });

  it("should return admin user when found", async () => {
    const mockAdmin = {
      id: "a1",
      email: "admin@test.com",
      name: "Admin",
      role: "ADMIN",
      avatar: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockAdminRepo.findById.mockResolvedValue(mockAdmin);

    const result = await useCase.execute("a1");

    expect(mockAdminRepo.findById).toHaveBeenCalledWith("a1");
    expect(result.id).toBe("a1");
    expect(result.email).toBe("admin@test.com");
  });

  it("should return null when admin not found", async () => {
    mockAdminRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute("missing");

    expect(result).toBeNull();
  });
});
