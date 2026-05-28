//

import { AuditStatus, ResourceType } from "@/modules/audit/infrastructure/database/models/audit-log.model";

export interface CreateAuditLogDTO {

  userId?: string;

  tenantId?: string;

  hostId?: string;

  action: string;

  resourceId: string;

  resourceType: ResourceType;

  status: AuditStatus;

  requestId?: string;

  correlationId?: string;

  meta?: Record<
    string,
    any
  >;
}