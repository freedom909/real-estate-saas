// src/core/admin/application/usecase/getAuditLogs.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAuditLogRepository, AuditLogFilter } from "../../domain/entities/IAuditLogRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class GetAuditLogsUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.auditLogRepository)
    private auditRepo: IAuditLogRepository
  ) {}

  async execute(limit: number = 50, filter?: AuditLogFilter) {
    const logs = filter
      ? await this.auditRepo.findFiltered(limit, filter)
      : await this.auditRepo.findAll(limit);

    return logs.map((log) => ({
      id: log.id,
      adminId: log.adminId,
      action: log.action,
      target: log.target,
      targetId: log.targetId,
      details: log.details,
      ip: log.ip,
      createdAt: log.createdAt,
    }));
  }
}
