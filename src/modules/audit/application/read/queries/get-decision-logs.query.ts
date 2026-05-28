//src/
import { inject, injectable } from "tsyringe";
import { IDecisionLogRepository } from "../../../domain/repositories/interface/decision-log.repository.interface";
import { DecisionLogDocument } from "../../../infrastructure/database/models/decision-log.model";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";

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
    @inject(TOKENS_AUDIT.repos.decisionLog)
    private readonly repository: IDecisionLogRepository
  ) {}

  async execute(
    filter: GetDecisionLogsFilter
  ): Promise<DecisionLogDocument[]> {
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