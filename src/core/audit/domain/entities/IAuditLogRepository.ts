import { ResourceType } from "../value-objects/audit.types";
import { AuditLog, AuditStatus } from "../entities/auditLog";

export interface AuditLogFilter {
  userId?: string;
  tenantId?: string;
  ownerId?: string;

  action?: string;

  resourceId?: string;
  resourceType?: ResourceType;

  status?: AuditStatus;

  requestId?: string;
  correlationId?: string;

  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogQueryOptions {
  limit?: number;
  skip?: number;
}

export interface IAuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;

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

  findByUserId(
    userId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;

  findByResource(
    resourceType: ResourceType,
    resourceId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;
}