//src/modules/audit/application/write/system-log.service.ts

import { inject, injectable } from "tsyringe";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";

import { CreateSystemLogDTO } from "../dto/create-system-log.dto";


import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { SystemLogDocument } from "@/modules/audit/infrastructure/database/models/system-log.model";

@injectable()
export class SystemLogService {
  constructor(
    @inject(TOKENS_AUDIT.repos.systemLogRepo)
    private readonly repository: ISystemLogRepository
  ) {}

  async writeSystemLog(
    dto: CreateSystemLogDTO
  ): Promise<SystemLogDocument> {
    return await this.repository.create(dto);
  }

  async debug(
    dto: CreateSystemLogDTO
  ): Promise<SystemLogDocument> {
    
    return await this.repository.create(dto);
  }
}