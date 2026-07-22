// src/core/admin/application/usecase/getAuditLogCount.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAuditLogRepository, AuditLogFilter } from "../../domain/entities/IAuditLogRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class GetAuditLogCountUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.auditLogRepository)
    private auditRepo: IAuditLogRepository
  ) {}

  async execute(filter?: AuditLogFilter): Promise<number> {
    if (filter && Object.keys(filter).length > 0) {
      return this.auditRepo.countFiltered(filter);
    }
    return this.auditRepo.countFiltered({});
  }
}
