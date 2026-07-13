import { DecisionSource } from "@/modules/audit/domain/enums/decision-log.enums";


export interface CreateDecisionLogDTO {
  meta: {
    executionId: string;
    correlationId?: string;
    requestId?: string;
    sessionId?: string;
  };
  actor: {
    userId?: string;
    tenantId?: string;
    ownerId?: string;
    role?: string;
  };
  input: {
    rawMessage: string;
    source: DecisionSource;
    locale?: string;
  };
  decision: {
    status: string;
    approved: boolean;
    confidence: number;
    reason?: string;
    riskLevel?: string;
    requiresHumanReview?: boolean;
  };
}