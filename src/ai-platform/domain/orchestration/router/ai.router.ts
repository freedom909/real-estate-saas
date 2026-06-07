// src/ai-platform/domain/orchestration/router/aiRouter.ts

import { injectable, inject } from "tsyringe";
import { AIDomain } from "../../semantic/types/ai.domain";
import { UserContext } from "../../semantic/types/userContext";

import { RuleEngine } from "../../semantic/extractors/rule.engine";
import LLMExtractor from "../../semantic/extractors/llm.extractor";
import { ConfidenceGuard } from "../../semantic/extractors/confidence.guard";

import { ListingAgent } from "../../agents/listing/listing.agent";
import { BookingAgent } from "../../agents/booking/booking.agent";

import { AuditEventPublisher } from "@/ai-platform/domain/audit/auditEvent.publisher";

@injectable()
export class AIRouter {

  constructor(
    private ruleEngine: RuleEngine,
    private llmExtractor: LLMExtractor,
    private guard: ConfidenceGuard,
    private listingAgent: ListingAgent,
    private bookingAgent: BookingAgent,

    @inject(AuditEventPublisher)
    private auditPublisher: AuditEventPublisher
  ) {}

  async route(message: string, user: UserContext) {

    const correlationId = crypto.randomUUID();

    // =====================================================
    // 1. RULE ENGINE (HARD PRIORITY)
    // =====================================================
    const rule = this.ruleEngine.match(message);

    if (rule.matched) {

      this.auditPublisher.publish({
        id: crypto.randomUUID(),
        type: "RULE_MATCH",
        intent: rule.intent!,
        domain: rule.domain!,
        confidence: rule.confidence,
        userId: user.userId,
       // action: rule.action!,
        timestamp: new Date(),
        metadata: {
          source: "RULE_ENGINE"
        }
      });

      return this.execute(rule, user);
    }

    // =====================================================
    // 2. LLM FALLBACK
    // =====================================================
    const llm = await this.llmExtractor.extract(message);

    // guard check
    if (!this.guard.shouldAccept(llm.confidence)) {

      this.auditPublisher.publish({
        id: crypto.randomUUID(),
        type: "LLM_REJECTED",
        intent: llm.intents[0].name,
        domain: llm.domain,
        confidence: llm.confidence,
        userId: user.userId,
       // action: llm.actions[0].name,
        timestamp: new Date(),
        metadata: {
          reason: "LOW_CONFIDENCE"
        }
      });

      throw new Error("Low confidence AI decision");
    }

    this.auditPublisher.publish({
      id: crypto.randomUUID(),
      type: "LLM_ACCEPTED",
      
      domain: llm.domain,
      confidence: llm.confidence,
      userId: user.userId,
      
      intent: llm.intents[0].name,
     
      timestamp: new Date(),
      metadata: {
        source: "LLM"
      }
    });

    return this.execute(llm, user);
  }

  // =====================================================
  // 3. DOMAIN ROUTER
  // =====================================================
  private execute(decision: any, user: UserContext) {

    switch (decision.domain) {

      case AIDomain.LISTING:
        return this.listingAgent.execute(decision, user);

      case AIDomain.BOOKING:
        return this.bookingAgent.execute(decision, user);

      default:
        throw new Error(
          `Unknown domain: ${decision.domain}`
        );
    }
  }
}