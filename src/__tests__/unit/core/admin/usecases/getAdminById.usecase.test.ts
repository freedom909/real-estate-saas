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

import GetAdminByIdUseCase from "@/core/admin/application/usecase/getAdminById.usecase";

describe("GetAdminByIdUseCase", () => {
  let useCase: GetAdminByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetAdminByIdUseCase as any)(mockAdminRepo);
  });

  it("should return the admin when found", async () => {
    const admin = { id: "admin-1", name: "Alice" };
    mockAdminRepo.findById.mockResolvedValue(admin);

    const result = await useCase.execute("admin-1");

    expect(mockAdminRepo.findById).toHaveBeenCalledWith("admin-1");
    expect(result).toEqual(admin);
  });

  it("should return null when admin not found", async () => {
    mockAdminRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute("missing-id");

    expect(result).toBeNull();
  });

  it("should propagate errors from the repository", async () => {
    mockAdminRepo.findById.mockRejectedValue(new Error("DB timeout"));

    await expect(useCase.execute("admin-1")).rejects.toThrow("DB timeout");
  });

  it("should forward an empty string id without validation", async () => {
    mockAdminRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute("");

    expect(mockAdminRepo.findById).toHaveBeenCalledWith("");
    expect(result).toBeNull();
  });
});
