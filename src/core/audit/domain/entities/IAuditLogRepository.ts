//src/core/audit/domain/entities/IAuditLogRepository.ts

import { ResourceType } from "../value-objects/audit.types";
import { AuditStatus } from "./auditLog";

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
