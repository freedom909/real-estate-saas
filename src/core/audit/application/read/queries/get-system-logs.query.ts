import { inject, injectable } from "tsyringe";

import { SystemLogDocument } from "../../../infrastructure/models/system-log.model";
import { SystemLogLevel } from "../../../domain/enums/system-log.enums";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { ISystemLogRepository } from "@/core/audit/domain/interface/system-log.repository.interface";
import { SystemLog } from "@/core/audit/domain/entities/systemLog.entity";

export interface GetSystemLogsFilter {
  level?: SystemLogLevel;
  service?: string;
  correlationId?: string;
  page?: number;
  limit?: number;
}

@injectable()
export class GetSystemLogsQuery {
  constructor(
    @inject(TOKENS_AUDIT.repos.systemLogRepo)
    private readonly repository: ISystemLogRepository
  ) {}

  async execute(
    filter: GetSystemLogsFilter
  ): Promise<SystemLog[]> {
    const {
      page = 1,
      limit = 20,
      ...query
    } = filter;

    const skip = (page - 1) * limit;

    return await this.repository.find(
      query,
      {
        limit,
        skip,
      }
    );
  }
}