import { inject, injectable } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import {IAuditLogRepository} from "@/core/audit/domain/interface/audit-log.repository.interface";

import {AuditLog} from "@/core/audit/domain/entities/auditLog";

export interface GetAuditLogsFilter {
  userId?: string;
  tenantId?: string;
  resourceId?: string;
  correlationId?: string;

  page?: number;
  limit?: number;
}

@injectable()
export class GetAuditLogsQuery {
  constructor(
    @inject(TOKENS_AUDIT.repos.auditLogRepository)
    private readonly repository: IAuditLogRepository
  ) {}

  async execute(
    filter: GetAuditLogsFilter
  ): Promise<AuditLog[]> {
    const {
      page = 1,
      limit = 20,
      ...query
    } = filter;

    const skip = (page - 1) * limit;

    return this.repository.findFiltered(
      query,
      {
        limit,
        skip,
      }
    );
  }
}