// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAuditRepo = {
  findAll: jest.fn(),
  findFiltered: jest.fn(),
  create: jest.fn(),
};

jest.mock("tsyringe", () => ({
  injectable: () => (target: any) => target,
  inject: () => () => {},
  container: { resolve: jest.fn(() => mockAuditRepo) },
}));

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { auditLogRepository: Symbol.for("AuditLogRepository") },
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-123"),
}));

import CreateAuditLogUseCase from "@/core/admin/application/usecase/createAuditLog.usecase";

describe("CreateAuditLogUseCase", () => {
  let useCase: CreateAuditLogUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (CreateAuditLogUseCase as any)(mockAuditRepo);
  });

  it("should create an audit log entry", async () => {
    const input = {
      adminId: "a1",
      action: "CREATE_ADMIN_USER",
      target: "admin_user",
      targetId: "a-new",
      details: "Created admin",
      ip: "127.0.0.1",
    };
    const createdLog = { id: "mock-uuid-123", ...input, createdAt: new Date() };
    mockAuditRepo.create.mockResolvedValue(createdLog);

    const result = await useCase.execute(input);

    expect(mockAuditRepo.create).toHaveBeenCalled();
    expect(result.id).toBe("mock-uuid-123");
    expect(result.adminId).toBe("a1");
    expect(result.action).toBe("CREATE_ADMIN_USER");
  });

  it("should create audit log without optional fields", async () => {
    const input = {
      adminId: "a1",
      action: "LOGIN",
      target: "session",
    };
    mockAuditRepo.create.mockResolvedValue({ id: "mock-uuid-123", ...input, createdAt: new Date() });

    const result = await useCase.execute(input);

    expect(result.targetId).toBeUndefined();
    expect(result.details).toBeUndefined();
    expect(result.ip).toBeUndefined();
  });
});
