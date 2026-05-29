//src/modules/audit/domain/repositories/interface/system-log.repository.interface.ts
import { SystemLog } from "../../types/system-log.type";

export interface ISystemLogRepository {
  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<SystemLog[]>;
  count(filter: any): Promise<number>;
  create(data: Partial<SystemLog>): Promise<SystemLog>;
  findById(id: string): Promise<SystemLog | null>;
}