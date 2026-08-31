//src/modules/audit/domain/entities/auditLog.ts

import { ResourceType } from "../value-objects/audit.types";

export type AuditStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING";

export interface AuditLog {
  id: string;

  userId?: string;
  tenantId?: string;
  ownerId?: string;

  action: string;

  resourceId: string;
  resourceType: ResourceType;

  status: AuditStatus;

  requestId?: string;
  correlationId?: string;

  meta?: Record<string, unknown>;

  createdAt: Date;
}