//src/core/audit/application/write/dto/create-decision-log.dto.ts

import { DecisionSource } from "@/core/audit/domain/enums/decision-log.enums";


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