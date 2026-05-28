//

import { inject, injectable } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import { IAuditLogRepository } from "@/modules/audit/domain/repositories/interface/audit-log.repository.interface";

import { AuditLogDocument } from "@/modules/audit/infrastructure/database/models/audit-log.model";

@injectable()
export class GetAuditLogsByResourceQuery {
  constructor(
    @inject(
      TOKENS_AUDIT.repos.auditLog
    )
    private readonly repository: IAuditLogRepository
  ) {}

  async execute(
    resourceId: string
  ): Promise<AuditLogDocument[]> {
    return await this.repository.find(
      { resourceId },
      {
        limit: 50,
        sort: {
          createdAt: -1,
        },
      }
    );
  }
}

export default GetAuditLogsByResourceQuery;

