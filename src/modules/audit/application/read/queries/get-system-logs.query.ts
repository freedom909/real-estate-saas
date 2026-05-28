import { inject, injectable } from "tsyringe";
import { ISystemLogRepository } from "../../../domain/repositories/interface/system-log.repository.interface";
import { SystemLogDocument } from "../../../infrastructure/database/models/system-log.model";
import { SystemLogLevel } from "../../../domain/enums/system-log.enums";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

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
    @inject(TOKENS_AUDIT.repos.systemLog)
    private readonly repository: ISystemLogRepository
  ) {}

  async execute(
    filter: GetSystemLogsFilter
  ): Promise<SystemLogDocument[]> {
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