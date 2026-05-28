import { inject, injectable } from "tsyringe";
import { TOKENS_AUDIT_WRITER } from "@/modules/tokens/audit.writer.tokens";
import { ISystemLogRepository } from "../../domain/repositories/i-system-log.repository";
import { CreateSystemLogDTO } from "../../domain/types/audit.types";
import { SystemLogDocument, LogLevel } from "../../infrastructure/database/models/system-log.model";

@injectable()
export class SystemLogService {
  constructor(
    @inject(TOKENS_AUDIT_WRITER.repos.systemLogRepo)
    private readonly repository: ISystemLogRepository
  ) {}

  async writeLog(data: CreateSystemLogDTO): Promise<SystemLogDocument> {
    return await this.repository.create(data);
  }

  async error(service: string, message: string, metadata?: any): Promise<SystemLogDocument> {
    return await this.writeLog({ level: "ERROR", type: "SYSTEM", service, message, metadata });
  }

  async warn(service: string, message: string, metadata?: any): Promise<SystemLogDocument> {
    return await this.writeLog({ level: "WARN", type: "SYSTEM", service, message, metadata });
  }

  async info(service: string, message: string, metadata?: any): Promise<SystemLogDocument> {
    return await this.writeLog({ level: "INFO", type: "SYSTEM", service, message, metadata });
  }

  async debug(service: string, message: string, metadata?: any): Promise<SystemLogDocument> {
    return await this.writeLog({ level: "DEBUG", type: "SYSTEM", service, message, metadata });
  }

  async getLogsByLevel(level: LogLevel): Promise<SystemLogDocument[]> {
    return await this.repository.findByLevel(level);
  }

  async getLogsByService(service: string): Promise<SystemLogDocument[]> {
    return await this.repository.findByService(service);
  }

  async getLogsByCorrelationId(correlationId: string): Promise<SystemLogDocument[]> {
    return await this.repository.findByCorrelationId(correlationId);
  }

  async cleanupOldLogs(days: number): Promise<number> {
    return await this.repository.deleteOldLogs(days);
  }
}