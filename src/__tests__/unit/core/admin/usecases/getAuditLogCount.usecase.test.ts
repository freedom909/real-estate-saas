// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockAuditRepo = {
  findAll: jest.fn(),
  findFiltered: jest.fn(),
  create: jest.fn(),
  countFiltered: jest.fn(),
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

import GetAuditLogCountUseCase from "@/core/admin/application/usecase/getAuditLogCount.usecase";

describe("GetAuditLogCountUseCase", () => {
  let useCase: GetAuditLogCountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (GetAuditLogCountUseCase as any)(mockAuditRepo);
  });

  it("should return count without filter", async () => {
    mockAuditRepo.countFiltered.mockResolvedValue(42);

    const result = await useCase.execute();

    expect(mockAuditRepo.countFiltered).toHaveBeenCalledWith({});
    expect(result).toBe(42);
  });

  it("should return count with filter", async () => {
    mockAuditRepo.countFiltered.mockResolvedValue(5);

    const result = await useCase.execute({ action: "CREATE" });

    expect(mockAuditRepo.countFiltered).toHaveBeenCalledWith({ action: "CREATE" });
    expect(result).toBe(5);
  });

  it("should return 0 when no logs match", async () => {
    mockAuditRepo.countFiltered.mockResolvedValue(0);

    const result = await useCase.execute({ target: "nonexistent" });

    expect(result).toBe(0);
  });
});
