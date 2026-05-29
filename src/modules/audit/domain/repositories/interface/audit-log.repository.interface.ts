//src/modules/audit/domain/repositories/interface/audit-log.repository.interface.ts

import { AuditLog } from "../../types/audit-log.type";






export interface IAuditLogRepository {

  create(
    data: Partial<AuditLog>
  ): Promise<AuditLog>;

  findById(
    id: string
  ): Promise<AuditLog | null>;

  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<AuditLog[]>;

  count(
    filter: any
  ): Promise<number>;
}