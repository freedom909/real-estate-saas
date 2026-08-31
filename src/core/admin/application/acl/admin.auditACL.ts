// src/core/admin/application/acl/admin.auditACL.ts

import { inject, injectable } from "tsyringe";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { AuditLogger } from "@/core/audit/application/write/services/audit.logger";
import {
  IAuditLogRepository,
  
} from "@/core/audit/domain/interface/audit-log.repository.interface";
import {
  AuditStatus,
  ResourceType,
} from "@/core/audit/domain/value-objects/audit.types";
import { CreateAuditLogDTO } from "@/core/audit/application/write/dto/create-audit-log.dto";
import { AuditLogFilter } from "@/core/audit/domain/entities/IAuditLogRepository";

export interface RecordAdminActionInput {
  adminId: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  tenantId?: string;
  ownerId?: string;
  requestId?: string;
  correlationId?: string;
  status?: AuditStatus;
  createdAt?: Date;
}

export interface AdminAuditLogFilter {
  action?: string;
  target?: string;
  resourceId?: string;
  adminId?: string;
  tenantId?: string;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface AdminAuditLogView {
  id: string;
  adminId?: string;
  action: string;
  target?: string;
  targetId?: string;
  details?: string;
  ip?: string;
  createdAt: Date | string;
}

const ADMIN_RESOURCE_TYPE: ResourceType = "ADMIN";
const DEFAULT_STATUS: AuditStatus = "SUCCESS";

function toResourceId(target: string, targetId?: string): string {
  if (targetId) return targetId;
  return target;
}

function toAdminView(raw: any): AdminAuditLogView {
  const details = (raw as any)?.meta?.reason;
  const ip = (raw as any)?.meta?.ip;
  const target =
    typeof (raw as any)?.resourceType === "string" &&
    (raw as any).resourceType === ADMIN_RESOURCE_TYPE &&
    !(raw as any)?.target
      ? "admin_action"
      : ((raw as any)?.target as string | undefined);
  return {
    id: raw.id,
    adminId: (raw as any)?.userId ?? ((raw as any)?.ownerId as string | undefined),
    action: raw.action,
    target:
      target ??
      ((raw as any)?.resourceType === ADMIN_RESOURCE_TYPE
        ? "admin_action"
        : ((raw as any)?.resourceType as string | undefined)),
    targetId: (raw as any)?.resourceId as string | undefined,
    details,
    ip,
    createdAt: raw.createdAt,
  };
}

function toAuditFilter(
  filter: AdminAuditLogFilter | undefined
): AuditLogFilter {
  const f: AuditLogFilter = { resourceType: ADMIN_RESOURCE_TYPE };
  if (!filter) return f;
  if (filter.action) f.action = filter.action;
  if (filter.adminId) f.userId = filter.adminId;
  if (filter.tenantId) f.tenantId = filter.tenantId;
  if (filter.resourceId) f.resourceId = filter.resourceId;
  if (filter.status) f.status = filter.status;
  if (filter.startDate) f.startDate = filter.startDate;
  if (filter.endDate) f.endDate = filter.endDate;
  return f;
}

@injectable()
export class AdminAuditACL {
  constructor(
    @inject(TOKENS_AUDIT.services.auditLogger)
    private readonly auditLogger: AuditLogger,
    @inject(TOKENS_AUDIT.repos.auditLogRepository)
    private readonly auditRepo: IAuditLogRepository
  ) {}

  async recordAdminAction(input: RecordAdminActionInput): Promise<AdminAuditLogView> {
    const status = input.status ?? DEFAULT_STATUS;
    const dto: CreateAuditLogDTO = {
      userId: input.adminId,
      ownerId: input.ownerId ?? input.adminId,
      tenantId: input.tenantId,
      action: input.action,
      resourceId: toResourceId(input.target, input.targetId),
      resourceType: ADMIN_RESOURCE_TYPE,
      status,
      requestId: input.requestId ?? input.adminId,
      correlationId: input.correlationId ?? input.targetId,
      createdAt: input.createdAt ?? new Date(),
      meta: {
        ip: input.ip,
        userAgent: input.userAgent,
        reason: input.details,
      },
    };
    const created = await this.auditLogger.writeAuditLog(dto);
    return {
      id: created.id,
      adminId: input.adminId,
      action: created.action,
      target: input.target,
      targetId: input.targetId,
      details: input.details,
      ip: input.ip,
      createdAt: (created as any).createdAt ?? dto.createdAt,
    };
  }

  async listAdminAuditLogs(
    limit: number = 50,
    filter?: AdminAuditLogFilter
  ): Promise<AdminAuditLogView[]> {
    const auditFilter = toAuditFilter(filter);
    const logs = await this.auditRepo.findFiltered(auditFilter, { limit, skip: 0 });
    return logs.map(toAdminView);
  }

  async countAdminAuditLogs(
    filter?: AdminAuditLogFilter
  ): Promise<number> {
    const auditFilter = toAuditFilter(filter);
    return this.auditRepo.countFiltered(auditFilter);
  }

  async listRecentAdminAuditLogs(
    limit: number = 10
  ): Promise<AdminAuditLogView[]> {
    const logs = await this.auditRepo.findAll({ limit, skip: 0 });
    return logs.map(toAdminView);
  }
}
