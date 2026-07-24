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

import GetAuditLogsUseCase from "@/core/admin/application/usecase/getAuditLogs.usecase";

describe("GetAuditLogsUseCase", () => {
  let useCase: GetAuditLogsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetAuditLogsUseCase as any)(mockAuditRepo);
  });

  it("should return audit logs without filter", async () => {
    const logs = [
      { id: "l1", adminId: "a1", action: "CREATE", target: "user", createdAt: new Date() },
      { id: "l2", adminId: "a2", action: "DELETE", target: "user", createdAt: new Date() },
    ];
    mockAuditRepo.findAll.mockResolvedValue(logs);

    const result = await useCase.execute(25);

    expect(mockAuditRepo.findAll).toHaveBeenCalledWith(25);
    expect(mockAuditRepo.findFiltered).not.toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("l1");
  });

  it("should use findFiltered when filter is provided", async () => {
    const filter = { action: "CREATE" };
    mockAuditRepo.findFiltered.mockResolvedValue([]);

    await useCase.execute(10, filter);

    expect(mockAuditRepo.findFiltered).toHaveBeenCalledWith(10, filter);
    expect(mockAuditRepo.findAll).not.toHaveBeenCalled();
  });

  it("should default limit to 50", async () => {
    mockAuditRepo.findAll.mockResolvedValue([]);

    await useCase.execute();

    expect(mockAuditRepo.findAll).toHaveBeenCalledWith(50);
  });

  it("should map log fields correctly", async () => {
    const log = {
      id: "l1",
      adminId: "a1",
      action: "LOGIN",
      target: "session",
      targetId: "s-1",
      details: "Logged in",
      ip: "1.1.1.1",
      createdAt: new Date("2024-06-01"),
    };
    mockAuditRepo.findAll.mockResolvedValue([log]);

    const result = await useCase.execute(1);

    expect(result[0]).toEqual({
      id: "l1",
      adminId: "a1",
      action: "LOGIN",
      target: "session",
      targetId: "s-1",
      details: "Logged in",
      ip: "1.1.1.1",
      createdAt: new Date("2024-06-01"),
    });
  });
});
