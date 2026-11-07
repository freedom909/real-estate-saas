
import { AuditLog } from "../entities/auditLog";
import { CreateAuditLogDTO } from "../../application/write/dto/create-audit-log.dto";
import {
  AuditLogFilter,
  AuditLogQueryOptions,
} from "../entities/IAuditLogRepository";
import { ResourceType } from "../value-objects/audit.types";

export interface AuditLogFindOptions extends AuditLogQueryOptions {
  sort?: any;
}

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

  findByUserId(
    userId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;

  findByResource(
    resourceType: ResourceType,
    resourceId: string,
    options?: AuditLogQueryOptions
  ): Promise<AuditLog[]>;

  find(
    filter: any,
    options?: AuditLogFindOptions
  ): Promise<AuditLog[]>;

  count(filter: any): Promise<number>;
}
