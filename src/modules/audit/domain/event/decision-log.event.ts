// src/modules/audit/domain/event/decision-log.event.ts
export interface DecisionLogEvent {
 id?: string,

  meta: {
    executionId: string,
    correlationId?: string,
    requestId?: string,
    sessionId?: string,
  },
  actor: {
    userId?: string,
    tenantId?: string,
    hostId?: string,
    role?: string,
  },
  input: {
    rawMessage: string,
    source: string,
    locale?: string,
  },
  decision:{
    status: string,
    approved: boolean,
    confidence: number,
    reason?: string,
    riskLevel?: string,
    requiresHumanReview: boolean,

  },
  createdAt: Date,

}