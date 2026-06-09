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
import { AIDecisionEvent } from "@/modules/audit/domain/event/aiDecision.event";
import { v4 as uuidv4 } from "uuid";
import { AIContext, AIRequest } from "@/ai-platform/context/types/context/aiContext";


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
  ) { }

  async route(request: AIRequest) {

    const correlationId = uuidv4();
    const context = request.context;
    if (context.trace) {
      context.trace.correlationId = correlationId;
    } else {
      context.trace = { correlationId };
    }

    // =====================================================
    // 1. RULE ENGINE (HARD PRIORITY)
    // =====================================================
    const rule = this.ruleEngine.match(request.message);

    if (rule.matched) {
      await this.auditPublisher.publish(
        new AIDecisionEvent(
          uuidv4(),
          "RULE_MATCH",
          rule.intent!,
          rule.domain!,
          rule.confidence,
          correlationId,
          context.identity.user?.id || "anonymous",
          { source: "RULE_ENGINE" }
        )
      );

      return this.execute(rule, context);
    }

    // =====================================================
    // 2. LLM FALLBACK
    // =====================================================
    const llm = await this.llmExtractor.extract(request.message);

    // guard check
    if (!this.guard.shouldAccept(llm.confidence)) {

      await this.auditPublisher.publish(
        new AIDecisionEvent(
          uuidv4(),
          "LLM_REJECTED",

          llm.action?.[0]?.name || "unknown", // intent

          llm.domain,                         // domain

          llm.confidence,                     // confidence
          correlationId,
          context.identity.user?.id || "anonymous",

          {
            reason: "LOW_CONFIDENCE"
          }
        )
      );

      throw new Error("Low confidence AI decision");
    }

    await this.auditPublisher.publish(
      new AIDecisionEvent(
        uuidv4(),
        "LLM_ACCEPTED",
        llm.action[0]?.name || "unknown",
        llm.domain,
        llm.confidence,
        correlationId,
        context.identity.user?.id || "anonymous",
        { source: "LLM" }
      )
    );

    return this.execute(llm, context);
  }

  // =====================================================
  // 3. DOMAIN ROUTER
  // =====================================================
  private execute(decision: any, context: AIContext) {
    decision.correlationId = context.trace?.correlationId;

    switch (decision.domain) {

      case AIDomain.LISTING:
        return this.listingAgent.execute(decision, context);

      case AIDomain.BOOKING:
        return this.bookingAgent.execute(decision, context);

      default:
        throw new Error(
          `Unknown domain: ${decision.domain}`
        );
    }
  }
}