import { SystemLogDocument, LogLevel } from "../../infrastructure/database/models/system-log.model";

export interface ISystemLogRepository {
  create(data: Partial<SystemLogDocument>): Promise<SystemLogDocument>;
  findByCorrelationId(correlationId: string): Promise<SystemLogDocument[]>;
  findByLevel(level: LogLevel): Promise<SystemLogDocument[]>;
  findByService(service: string): Promise<SystemLogDocument[]>;
  deleteOldLogs(days: number): Promise<number>;
}