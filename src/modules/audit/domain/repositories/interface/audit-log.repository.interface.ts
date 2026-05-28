import { AuditLogDocument } from "@/modules/audit/infrastructure/database/models/audit-log.model";

export interface IAuditLogRepository {
  create(data: Partial<AuditLogDocument>): Promise<AuditLogDocument>;
  findById(id: string): Promise<AuditLogDocument | null>;
  find(filter: any, options?: { limit?: number; skip?: number; sort?: any }): Promise<AuditLogDocument[]>;
  count(filter: any): Promise<number>;
}