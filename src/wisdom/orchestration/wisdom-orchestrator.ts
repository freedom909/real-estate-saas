// src/wisdom/orchestration/wisdom-orchestrator.ts
//
// WisdomOrchestrator — the central pipeline.
//
// Pipeline:
//   1. SemanticExtractor      → understand intent + entities
//   2. ReferenceResolver       → resolve ordinals, pronouns
//   3. AgentRouter             → route to correct domain agent
//   4. Agent.execute()         → produce artifacts
//   5. KnowledgeExtractor      → extract knowledge deltas
//   6. KnowledgeStore          → persist to long-term memory
//   7. SummaryScheduler        → buffer turns, async summarization
//   8. BookingStateUpdater     → legacy session memory update (kept for compat)
//   9. Build WisdomResponse
//
// ────────────────────────────────────────────────────────────────

import { inject, injectable } from "tsyringe";
import { ISemanticExtractor } from "../contracts/semantic-extractor";
import { IReferenceResolver } from "../contracts/reference-resolver";
import { AgentRouter } from "../agents/agent-router";
import { BookingStateUpdater } from "../memory/booking-state-updater";
import { KnowledgeExtractor } from "../memory/extractor/knowledge.extractor";
import { KnowledgeStore } from "../memory/knowledge.store";
import { SummaryScheduler } from "../memory/summary/summary-scheduler";
import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { AIDomain } from "../shared/enums/domain.enum";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { AgentAction, SemanticContext } from "../semantic/semantic-context";

import { MemoryContext, buildMemoryContext } from "../memory/type/memory-context";


@injectable()
export class WisdomOrchestrator {
  constructor(
    @inject(WISDOM_TOKENS.semanticExtractor)
    private semanticExtractor: ISemanticExtractor,

    @inject(WISDOM_TOKENS.referenceResolver)
    private referenceResolver: IReferenceResolver,

    @inject(WISDOM_TOKENS.router)
    private agentRouter: AgentRouter,

    @inject(WISDOM_TOKENS.memory.bookingStateUpdater)
    private bookingStateUpdater: BookingStateUpdater,

    @inject(WISDOM_TOKENS.memory.knowledgeExtractor)
    private knowledgeExtractor: KnowledgeExtractor,

    @inject(WISDOM_TOKENS.memory.knowledgeStore)
    private knowledgeStore: KnowledgeStore,

    @inject(WISDOM_TOKENS.memory.summaryScheduler)
    private summaryScheduler: SummaryScheduler,
  ) { }

  async handle(request: WisdomRequest): Promise<WisdomResponse> {
    // ── 0. Unified memory context ──
 const memoryContext: MemoryContext = {
    userId: request.context.identity.user.id,
    sessionId: request.context.runtime.sessionId,
    session: {},
};


const knowledge = await this.knowledgeStore.load(memoryContext);
    // ── 1. Semantic extraction ──
    const semantic = await this.semanticExtractor.extract(request);

    // ── 2. Reference resolution ──
    const resolvedSemantic = await this.referenceResolver.resolve(
      semantic,
      request.context,
    );
    this.normalizeBookingIntent(resolvedSemantic);

    // ── 3. Route to agent ──
    const agent = this.agentRouter.route(resolvedSemantic);

    // ── 4. Execute agent ──
    let raw: any;
    try {
      raw = await agent.execute(resolvedSemantic, request.context);
    } catch (err) {
      console.error("❌ Agent execution failed:", err);
      throw err;
    }

    // ── 5. Build response ──
    const response: WisdomResponse = {
      success: raw?.success ?? true,
      domain: raw?.domain ?? (resolvedSemantic.domain as AIDomain) ?? AIDomain.GENERAL,
      primaryAction: raw?.primaryAction ?? {
        name: resolvedSemantic.action?.type ?? "UNKNOWN",
        confidence: resolvedSemantic.confidence ?? 0,
      },
      summary: raw?.summary ?? raw?.message ?? "",
      artifacts: raw?.artifacts ?? [],
      metadata: {
        durationMs: Date.now() - ((request as any).startTime ?? Date.now()),
        executedSteps: raw?.executedSteps ?? [],
      },
    };
   
    // ── 6. Extract knowledge deltas ──
    const knowledgeDeltas = await this.knowledgeExtractor.extract(
      resolvedSemantic,
      response,
      request.context,
      knowledge,
    );

    // ── 7. Persist knowledge ──
    if (knowledgeDeltas.length > 0) {
      await this.knowledgeStore.persist(memoryContext, knowledgeDeltas);
      console.log(`🧠 ${knowledgeDeltas.length} knowledge deltas persisted for user ${memoryContext.userId}`);
    }

    // ── 8. Summary Pipeline (async, non-blocking) ──
    // Buffer the turn and check if summarization is needed
    this.summaryScheduler.onTurnComplete(memoryContext, {
      role: "user",
      content: request.message,
      timestamp: Date.now(),
      metadata: {
        domain: resolvedSemantic.domain as string,
        action: resolvedSemantic.action?.type,
      },
    }).catch((err) => console.error("❌ Summary scheduler error:", err));

    this.summaryScheduler.onTurnComplete(memoryContext, {
      role: "assistant",
      content: response.summary,
      timestamp: Date.now(),
      metadata: {
        domain: response.domain as string,
        action: response.primaryAction?.name,
        artifacts: response.artifacts,
      },
    }).catch((err) => console.error("❌ Summary scheduler error:", err));

    // ── 9. Legacy: update session memory + booking state ──
    // const sessionMem = sessionMemory.get(ctx.sessionId) ?? {};
    for (const artifact of response.artifacts ?? []) {
      this.bookingStateUpdater.apply(memoryContext, artifact);
    }
    // sessionMemory.set(ctx.sessionId, sessionMem);
    console.log("ARTIFACTS:", response.artifacts);
    return response;
  }

  // ════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════

  /**
   * Normalize booking intent: if user says "book" but semantic didn't pick it up,
   * force the action.
   */
  private normalizeBookingIntent(semantic: SemanticContext): void {
    const raw = semantic.rawInput?.toLowerCase() ?? "";
    const hasBookingIntent =
      /\b(book|reserve|confirm)\b/.test(raw) &&
      !/\b(cancel|delete)\b/.test(raw);

    if (hasBookingIntent && !semantic.hasAction?.("CREATE_BOOKING" as any)) {
      // Nudge the semantic context — this is a booking flow
      if (!semantic.action) {
        (semantic as any).action = {
          type: "CREATE_BOOKING" as any,
          confidence: 0.7,
        };
      }
    }
  }
}
