import { inject, injectable } from "tsyringe";
import { TOKENS_AUDIT_WRITER } from "@/modules/tokens/audit.writer.tokens";
import { IDecisionLogRepository } from "../../domain/repositories/i-decision-log.repository";
import { CreateDecisionLogDTO } from "../../domain/types/audit.types";
import { DecisionLogDocument } from "../../infrastructure/database/models/decision-log.model";

@injectable()
export class DecisionLogService {
  constructor(
    @inject(TOKENS_AUDIT_WRITER.repos.decisionLogRepo)
    private readonly repository: IDecisionLogRepository
  ) {}

  async writeDecisionLog(data: CreateDecisionLogDTO): Promise<DecisionLogDocument> {
    return await this.repository.create(data);
  }

  async getDecisionHistory(executionId: string): Promise<DecisionLogDocument | null> {
    return await this.repository.findLatestByExecutionId(executionId);
  }

  async getLogsByUserId(userId: string): Promise<DecisionLogDocument[]> {
    return await this.repository.findByUserId(userId);
  }

  async getLogsByTenantId(tenantId: string): Promise<DecisionLogDocument[]> {
    return await this.repository.findByTenantId(tenantId);
  }

  async getLogsByCorrelationId(correlationId: string): Promise<DecisionLogDocument[]> {
    return await this.repository.findByCorrelationId(correlationId);
  }
}