// ai-platform/domain/events/aiDecision.event.ts

export interface AIDecisionEvent {
  id: string;

  type:
    | "RULE_MATCH"
    | "LLM_FALLBACK"
    | "ROUTE_EXECUTED";

  intent: string;
  domain: string;
  confidence: number;

  userId?: string;

  correlationId: string;

  timestamp: Date;

  metadata?: Record<string, any>;
}