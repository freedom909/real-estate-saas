// src/core/audit/application/read/queries/get-audit-logs-by-resource.query.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import {
  IAuditLogRepository,
} from "@/core/audit/domain/entities/IAuditLogRepository";

import { AuditLog } from "@/core/audit/domain/entities/auditLog";

import { ResourceType } from "@/core/audit/domain/value-objects/audit.types";

@injectable()
export class GetAuditLogsByResourceQuery {
  constructor(
    @inject(TOKENS_AUDIT.repos.auditLogRepository)
    private readonly repository: IAuditLogRepository
  ) {}

  async execute(
    resourceType: ResourceType,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.repository.findByResource(
      resourceType,
      resourceId,
      {
        limit,
      }
    );
  }
}

export default GetAuditLogsByResourceQuery;