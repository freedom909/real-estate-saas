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

jest.mock("@/core/admin/domain/value-objects/email", () => {
  // Don't mock - let the real Email class be used
  return jest.requireActual("@/core/admin/domain/value-objects/email");
});

// We need to import the entity so the use case can use it
// The use case receives an already-instantiated entity from the repo mock
import UpdateAdminUserUseCase from "@/core/admin/application/usecase/updateAdminUser.usecase";
import { AdminUser } from "@/core/admin/domain/entities/adminUser";
import { Email } from "@/core/admin/domain/value-objects/email";

function makeMockAdmin(overrides: any = {}) {
  const defaults = {
    id: "a1",
    email: new Email("admin@test.com"),
    name: "Admin",
    role: "ADMIN",
    avatar: undefined as string | undefined,
    isActive: true,
    immutable: false,
    lastLoginAt: undefined as Date | undefined,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };
  const props = { ...defaults, ...overrides };
  const admin = new AdminUser(props);
  return admin;
}

describe("UpdateAdminUserUseCase", () => {
  let useCase: UpdateAdminUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (UpdateAdminUserUseCase as any)(mockAdminRepo);
  });

  it("should update admin name", async () => {
    const admin = makeMockAdmin();
    mockAdminRepo.findById.mockResolvedValue(admin);
    mockAdminRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute("a1", { name: "New Name" });

    expect(mockAdminRepo.findById).toHaveBeenCalledWith("a1");
    expect(mockAdminRepo.update).toHaveBeenCalled();
    expect(result.name).toBe("New Name");
  });

  it("should update admin role", async () => {
    const admin = makeMockAdmin();
    mockAdminRepo.findById.mockResolvedValue(admin);
    mockAdminRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute("a1", { role: "SUPER_ADMIN" });

    expect(result.role).toBe("SUPER_ADMIN");
  });

  it("should deactivate admin", async () => {
    const admin = makeMockAdmin();
    mockAdminRepo.findById.mockResolvedValue(admin);
    mockAdminRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute("a1", { isActive: false });

    expect(result.isActive).toBe(false);
  });

  it("should activate admin", async () => {
    const admin = makeMockAdmin({ isActive: false });
    mockAdminRepo.findById.mockResolvedValue(admin);
    mockAdminRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute("a1", { isActive: true });

    expect(result.isActive).toBe(true);
  });

  it("should throw when admin not found", async () => {
    mockAdminRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute("missing", { name: "New" })
    ).rejects.toThrow("Admin not found");
  });

  it("should return full admin object", async () => {
    const admin = makeMockAdmin();
    mockAdminRepo.findById.mockResolvedValue(admin);
    mockAdminRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute("a1", { name: "Updated" });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("role");
    expect(result).toHaveProperty("isActive");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});
