
// src/core/audit/application/write/services/system-log.service.ts

import { inject, injectable } from "tsyringe";

import { CreateSystemLogDTO } from "../dto/create-system-log.dto";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

import { ISystemLogRepository } from "@/core/audit/domain/interface/system-log.repository.interface";
import { SystemLog } from "@/core/audit/domain/entities/systemLog.entity";



@injectable()
export class SystemLogService {
  constructor(
    @inject(TOKENS_AUDIT.repos.systemLogRepo)
    private readonly repository: ISystemLogRepository
  ) {}

  async writeSystemLog(
    dto: CreateSystemLogDTO
  ): Promise<SystemLog> {
    return this.repository.create(dto);
  }

  async debug(
    dto: CreateSystemLogDTO
  ): Promise<SystemLog> {
    return this.repository.create(dto);
  }
}