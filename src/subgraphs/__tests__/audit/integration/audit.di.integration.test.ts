//src/subgraphs/__tests__/audit/integration/audit.di.integration.test.ts


import "reflect-metadata";

import { container } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import registerAuditDependencies from "@/modules/container/audit.register";

import { AuditLogModel } from "@/core/audit/domain/value-objects/audit-log.model";
import { AuditLogRepository } from "@/core/audit/infrastructure/repositories/auditLog.repository";
import { AuditLogger } from "@/core/audit/application/write/services/audit.logger";
import { GetAuditLogsQuery } from "@/core/audit/application/read/queries/get-audit-logs.query";

describe("Audit Dependency Injection Integration", () => {
  const testContainer = container.createChildContainer();

  beforeAll(() => {
    registerAuditDependencies(testContainer);
  });

  it("should register the AuditLogModel", () => {
    const model = testContainer.resolve(
      TOKENS_AUDIT.models.auditLogModel
    );

    expect(model).toBe(AuditLogModel);
  });

  it("should resolve AuditLogRepository", () => {
    const repository = testContainer.resolve<AuditLogRepository>(
      TOKENS_AUDIT.repos.auditLogRepository
    );

    expect(repository).toBeInstanceOf(AuditLogRepository);
  });

  it("should resolve AuditLogger with its repository dependency", () => {
    const logger = testContainer.resolve<AuditLogger>(
      TOKENS_AUDIT.services.auditLogger
    );

    expect(logger).toBeInstanceOf(AuditLogger);
  });

  it("should resolve GetAuditLogsQuery with its repository dependency", () => {
    const query = testContainer.resolve<GetAuditLogsQuery>(
      TOKENS_AUDIT.services.getAuditLogsQuery
    );

    expect(query).toBeInstanceOf(GetAuditLogsQuery);
  });

  it("should register the auditRepo alias", () => {
    const repository = testContainer.resolve(
      TOKENS_AUDIT.repos.auditRepo
    );

    expect(repository).toBeInstanceOf(AuditLogRepository);
  });
});
