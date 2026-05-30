//src/modules/audit/application/write/audit-log.service.ts

import { inject, injectable }
from "tsyringe";



import {
  IAuditLogRepository
}
from "../../../domain/repositories/interface/audit-log.repository.interface";

import {
  CreateAuditLogDTO
}
from "../dto/create-audit-log.dto";

import { AuditLogDocument } from "@/modules/audit/infrastructure/database/models/audit-log.model";
import { AuditLog } from "@/modules/audit/domain/types/audit-log.type";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class AuditLogService {

  constructor(
    @inject(
      TOKENS_AUDIT.repos.auditLog
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