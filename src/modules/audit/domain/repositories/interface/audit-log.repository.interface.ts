//src/modules/audit/domain/repositories/interface/audit-log.repository.interface.ts

import { AuditRepo } from "@/security/infrastructure/audit.repo";







export interface IAuditLogRepository {

  create(
    data: Partial<AuditRepo>
  ): Promise<AuditRepo>;

  findById(
    id: string
  ): Promise<AuditRepo | null>;

  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<AuditRepo[]>;

  count(
    filter: any
  ): Promise<number>;
}