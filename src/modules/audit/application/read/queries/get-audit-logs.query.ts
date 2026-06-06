//
import {
  inject,
  injectable,
} from "tsyringe";


import {
  IAuditLogRepository,
} from "../../../domain/repositories/interface/audit-log.repository.interface";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditRepo } from "@/security/infrastructure/audit.repo";



export interface GetAuditLogsFilter {

  userId?: string;

  tenantId?: string;

  resourceId?: string;

  correlationId?: string;

  page?: number;

  limit?: number;
}

@injectable()
export class
GetAuditLogsQuery {

  constructor(
    @inject(
      TOKENS_AUDIT.repos.auditRepo
    )
    private readonly repository:
      IAuditLogRepository
  ) {}

  async execute(
    filter:
      GetAuditLogsFilter
  ): Promise<
    AuditRepo[]
  > {

    const {
      page = 1,
      limit = 20,
      ...query
    } = filter;

    const skip =
      (page - 1)
      * limit;

    return await
      this.repository.find(
        query,
        {
          limit,
          skip,
        }
      );
  }
}