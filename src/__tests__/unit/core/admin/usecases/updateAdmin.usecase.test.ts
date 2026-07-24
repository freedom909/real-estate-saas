// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  update: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
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

import UpdateAdminUseCase from "@/core/admin/application/usecase/updateAdmin.usecase";

function createMockAdmin(overrides = {}) {
  return {
    id: "admin-1",
    email: "admin@example.com",
    name: "Test Admin",
    role: "ADMIN",
    avatar: undefined,
    isActive: true,
    immutable: false,
    lastLoginAt: undefined,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("UpdateAdminUseCase", () => {
  let useCase: UpdateAdminUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (UpdateAdminUseCase as any)(mockAdminRepo);
  });

  it("should call repo.update with the given id and admin entity", async () => {
    const admin = createMockAdmin();
    mockAdminRepo.update.mockResolvedValue(true);

    const result = await useCase.execute("admin-1", admin);

    expect(mockAdminRepo.update).toHaveBeenCalledWith("admin-1", admin);
    expect(result).toBe(true);
  });

  it("should return false when repo.update returns false", async () => {
    const admin = createMockAdmin();
    mockAdminRepo.update.mockResolvedValue(false);

    const result = await useCase.execute("admin-1", admin);

    expect(result).toBe(false);
  });

  it("should propagate errors from the repository", async () => {
    const admin = createMockAdmin();
    mockAdminRepo.update.mockRejectedValue(new Error("Concurrent update"));

    await expect(useCase.execute("admin-1", admin)).rejects.toThrow(
      "Concurrent update"
    );
  });

  it("should forward any id and admin without validation", async () => {
    const admin = createMockAdmin({ id: "other-id" });
    mockAdminRepo.update.mockResolvedValue(true);

    await useCase.execute("admin-1", admin);

    expect(mockAdminRepo.update).toHaveBeenCalledWith("admin-1", admin);
  });
});
