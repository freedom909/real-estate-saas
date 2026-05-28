//
import { inject, injectable }
from "tsyringe";


import {
  IAuditLogRepository,
} from "../../../domain/repositories/interface/audit-log.repository.interface";

import {
  AuditLogDocument,
} from "../../../infrastructure/database/models/audit-log.model";
import { CreateAuditLogDTO } from "../dto/create-audit-log.dto";
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

//   async writeAuditLog(
//     dto: CreateAuditLogDTO
//   ): Promise<
//     AuditLogDocument
//   > {

//     return await this.repository.create(dto);
//   }
}