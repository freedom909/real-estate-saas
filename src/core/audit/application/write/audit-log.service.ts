// src/core/audit/application/write/audit-log.service.ts

import { IAuditLogRepository } from "../../domain/interface/audit-log.repository.interface";
import { CreateAuditLogDTO } from "./dto/create-audit-log.dto";
import { AuditLog } from "../../domain/entities/auditLog";

export class AuditLogService {
  constructor(private readonly repository: IAuditLogRepository) {}

  async writeAuditLog(dto: CreateAuditLogDTO): Promise<AuditLog> {
    return this.repository.create(dto);
  }
}
