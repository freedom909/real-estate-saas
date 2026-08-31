//src/modules/audit/application/write/audit-log.service.ts

import { inject, injectable }
from "tsyringe";



import {
  IAuditLogRepository
}
from "../../../domain/interface/audit-log.repository.interface";

import {
  CreateAuditLogDTO
}
from "../dto/create-audit-log.dto";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditLog } from "@/core/audit/domain/entities/auditLog";


@injectable()
export class AuditLogger {

  constructor(
    @inject(
      TOKENS_AUDIT.repos.auditLogRepository
    )
    private readonly repository:
      IAuditLogRepository
  ) {}

  async writeAuditLog(
    dto: CreateAuditLogDTO
  ): Promise<AuditLog> {

    return await this.repository.create(
      dto
    );
  }
}