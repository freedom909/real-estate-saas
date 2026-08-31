//src/
import { inject, injectable } from "tsyringe";

import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { IDecisionLogRepository } from "@/core/audit/domain/interface/decision-log.repository.interface";
import { DecisionLog } from "@/core/audit/domain/entities/decisionLog";


export interface GetDecisionLogsFilter {
  executionId?: string;
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  page?: number;
  limit?: number;
}

@injectable()
export class GetDecisionLogsQuery {
  constructor(
    @inject(TOKENS_AUDIT.repos.decisionLogRepo)
    private readonly repository: IDecisionLogRepository
  ) {}

  async execute(
    filter: GetDecisionLogsFilter
  ): Promise<DecisionLog[]> {
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