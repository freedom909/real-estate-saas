import { inject, injectable } from "tsyringe";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";
import { SystemLogDocument } from "../../../infrastructure/database/models/system-log.model";
import { CreateSystemLogDTO } from "../dto/create-system-log.dto";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class SystemLogService {
  constructor(
    @inject(TOKENS_AUDIT.repos.systemLog)
    private readonly repository: ISystemLogRepository
  ) {}

  async writeSystemLog(
    dto: CreateSystemLogDTO
  ): Promise<SystemLogDocument> {
    // Application write services may ONLY call repository.create()
    return await this.repository.create(dto);
  }
}