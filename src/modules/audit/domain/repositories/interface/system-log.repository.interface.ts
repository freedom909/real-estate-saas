import { SystemLogDocument } from "../../../infrastructure/database/models/system-log.model";

export interface ISystemLogRepository {
  find(
    filter: any,
    options?: {
      limit?: number;
      skip?: number;
      sort?: any;
    }
  ): Promise<SystemLogDocument[]>;
  count(filter: any): Promise<number>;
  create(data: Partial<SystemLogDocument>): Promise<SystemLogDocument>;
  findById(id: string): Promise<SystemLogDocument | null>;
}