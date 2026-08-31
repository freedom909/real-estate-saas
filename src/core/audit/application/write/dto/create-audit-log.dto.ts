//

import { AuditStatus, ResourceType } from "@/core/audit/domain/value-objects/audit.types";

export interface CreateAuditLogDTO {

  userId?: string;

  tenantId?: string;

  ownerId?: string;

  action: string;
  resource?: string;
  resourceId: string;

  resourceType: ResourceType;

  status: AuditStatus;

  requestId?: string;
  createdAt?: Date;
  correlationId?: string;

  meta?: {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  provider?: string;
  reason?: string;
  
  };
}