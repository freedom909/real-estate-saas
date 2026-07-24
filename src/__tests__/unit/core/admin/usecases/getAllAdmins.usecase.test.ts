// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAdminRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
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

import GetAllAdminsUseCase from "@/core/admin/application/usecase/getAllAdmins.usecase";

describe("GetAllAdminsUseCase", () => {
  let useCase: GetAllAdminsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetAllAdminsUseCase as any)(mockAdminRepo);
  });

  it("should call repo.findAll and return the list", async () => {
    const admins = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];
    mockAdminRepo.findAll.mockResolvedValue(admins);

    const result = await useCase.execute();

    expect(mockAdminRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(admins);
  });

  it("should return an empty array when no admins exist", async () => {
    mockAdminRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it("should propagate errors from the repository", async () => {
    mockAdminRepo.findAll.mockRejectedValue(new Error("Connection refused"));

    await expect(useCase.execute()).rejects.toThrow("Connection refused");
  });

  it("should return a single-element array", async () => {
    const admin = { id: "1", name: "Solo" };
    mockAdminRepo.findAll.mockResolvedValue([admin]);

    const result = await useCase.execute();

    expect(result).toEqual([admin]);
    expect(result).toHaveLength(1);
  });
});
