import { DecisionLogDocument } from "../../infrastructure/database/models/decision-log.model";

export interface IDecisionLogRepository {
  create(data: Partial<DecisionLogDocument>): Promise<DecisionLogDocument>;
  findById(id: string): Promise<DecisionLogDocument | null>;
  findByCorrelationId(correlationId: string): Promise<DecisionLogDocument[]>;
  findByUserId(userId: string): Promise<DecisionLogDocument[]>;
  findByTenantId(tenantId: string): Promise<DecisionLogDocument[]>;
  findLatestByExecutionId(executionId: string): Promise<DecisionLogDocument | null>;
}