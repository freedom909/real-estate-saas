import { AuditLogDocument } from "../../infrastructure/database/models/audit-log.model";

export interface IAuditLogRepository {
  create(data: Partial<AuditLogDocument>): Promise<AuditLogDocument>;
  findById(id: string): Promise<AuditLogDocument | null>;
  findByResourceId(resourceId: string): Promise<AuditLogDocument[]>;
  findByCorrelationId(correlationId: string): Promise<AuditLogDocument[]>;
  findByUserId(userId: string): Promise<AuditLogDocument[]>;
  findByTenantId(tenantId: string): Promise<AuditLogDocument[]>;
}