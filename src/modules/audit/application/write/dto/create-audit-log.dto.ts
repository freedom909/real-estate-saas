//

import { AuditStatus, ResourceType } from "@/modules/audit/infrastructure/database/models/audit-log.model";

export interface CreateAuditLogDTO {

  userId?: string;

  tenantId?: string;

  ownerId?: string;

  action: string;

  resourceId: string;

  resourceType: ResourceType;

  status: AuditStatus;

  requestId?: string;

  correlationId?: string;

  meta?: {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  provider?: string;
  reason?: string;
  
  };
}