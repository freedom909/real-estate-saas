// src/core/audit/domain/interface/audit-log.repository.interface.ts

import { AuditLog } from "../entities/auditLog";
import { CreateAuditLogDTO } from "../../application/write/dto/create-audit-log.dto";
import {
  AuditLogFilter,
  AuditLogQueryOptions,
} from "../entities/IAuditLogRepository";

export interface IAuditLogRepository {

  create(data: CreateAuditLogDTO): Promise<AuditLog>;

  findAll(
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;

  findFiltered(
    filter: AuditLogFilter,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;

  countFiltered(
    filter: AuditLogFilter
  ): Promise<number>;

  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<AuditLog[]>;

  count(filter: any): Promise<number>;
}