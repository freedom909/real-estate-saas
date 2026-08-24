import { AuditStatus, ResourceType } from "@/modules/audit/infrastructure/models/audit-log.model";

export interface AuditLog {
  id: string;

  userId?: string;

  tenantId?: string;

  ownerId?: string;

  action: string;

  resourceId?: string;

  resourceType?: ResourceType;

  status?: AuditStatus;

  requestId?: string;

  correlationId?: string;

  meta?: Record<string, unknown>;

  createdAt: Date;
}
