// ai-platform/domain/events/aiDecision.event.ts

import { DomainEvent } from "@/shared/eventbus/domain.event";

export class AIDecisionEvent extends DomainEvent {
  readonly eventName = "ai.decision_made";

  constructor(
    public readonly id: string,
    public readonly type:
      | "RULE_MATCH"
      | "LLM_FALLBACK"
      | "ROUTE_EXECUTED"
      | "LLM_REJECTED"
      | "LLM_ACCEPTED",
    public readonly intent: string,
    public readonly domain: string,
    public readonly confidence: number,
    public readonly correlationId: string,
    public readonly userId?: string,
    public readonly metadata?: Record<string, any>
  ) {
    super();
  }
}