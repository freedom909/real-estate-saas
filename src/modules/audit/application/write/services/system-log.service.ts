//src/modules/audit/application/write/system-log.service.ts

import { inject, injectable } from "tsyringe";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";
import { SystemLogDocument } from "../../../infrastructure/database/models/system-log.model";
import { CreateSystemLogDTO } from "../dto/create-system-log.dto";

import { SystemLog } from "@/modules/audit/domain/types/system-log.type";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

@injectable()
export class SystemLogService {
  constructor(
    @inject(TOKENS_AUDIT.repos.systemLog)
    private readonly repository: ISystemLogRepository
  ) {}

  async writeSystemLog(
    dto: CreateSystemLogDTO
  ): Promise<SystemLog> {
  
    return await this.repository.create(dto);
  }
}