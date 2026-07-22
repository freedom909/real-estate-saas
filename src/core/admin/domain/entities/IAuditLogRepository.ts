// src/core/admin/domain/entities/IAuditLogRepository.ts

import { AuditLog } from "./auditLog";

export interface AuditLogFilter {
  adminId?: string;
  action?: string;
  target?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IAuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findAll(limit?: number): Promise<AuditLog[]>;
  findFiltered(limit: number, filter: AuditLogFilter): Promise<AuditLog[]>;
  countFiltered(filter: AuditLogFilter): Promise<number>;
  findByAdminId(adminId: string, limit?: number): Promise<AuditLog[]>;
  findByTarget(target: string, limit?: number): Promise<AuditLog[]>;
}
