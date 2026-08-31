// shared/types/audit-log.event.ts
export interface AuditLogEvent {
  id?: string;
  userId?: string;
  action: string;
  resourceId: string;
  resourceType: string;
  status: string;
  correlationId?: string;
  createdAt?: Date;
  tenantId?: string;
  ownerId?: string;
  requestId?: string;
  meta?: {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  provider?: string;

  reason?: string;
}


}