// src/modules/audit/domain/entities/decisionLog.ts

export type DecisionLogSource =
  | "CHAT"
  | "API"
  | "SYSTEM";

export interface DecisionLog {
  id: string;

  meta: {
    executionId?: string;
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
    rawMessage?: string;
    source?: DecisionLogSource;
    locale?: string;
  };

  decision: {
    status: string;
    approved?: boolean;
    confidence?: number;
    reason?: string;
    riskLevel?: string;
    requiresHumanReview?: boolean;
  };

  createdAt: Date;
}