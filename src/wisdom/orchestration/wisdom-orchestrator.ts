// src/wisdom/orchestration/wisdom-orchestrator.ts

import { inject, injectable } from "tsyringe";
import { ISemanticExtractor } from "../contracts/semantic-extractor";
import { IReferenceResolver } from "../contracts/reference-resolver";
import { AgentRouter } from "../agents/agent-router";
import { BookingStateUpdater } from "../memory/booking-state-updater";
import { WisdomRequest } from "../contracts/request";
import { WisdomResponse } from "../contracts/response";
import { AIDomain } from "../shared/enums/domain.enum";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { AgentAction, EntityType, SemanticContext } from "../semantic/semantic-context";


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
  ) { }

  async handle(request: WisdomRequest): Promise<WisdomResponse> {

    // 1. Extract intent + entities from user message
    const semantic = await this.semanticExtractor.extract(request);

    // 2. Resolve references (ordinals, pronouns, etc.)
    const resolvedSemantic = await this.referenceResolver.resolve(
      semantic,
      request.context,
    );
    this.normalizeBookingIntent(resolvedSemantic);
    // 3. Route to the correct domain agent
    const agent = this.agentRouter.route(resolvedSemantic);

    // 4. Execute the agent
    let raw: any;
    try {
      raw = await agent.execute(resolvedSemantic, request.context);
    } catch (err) {
      console.error("❌ Agent execution failed:", err);
      throw err;
    }

    // 5. Update memory with artifacts
    const artifact = raw?.artifacts?.[0];
    if (artifact) {

      this.bookingStateUpdater.apply(request.context, artifact);
    }

    // 6. Build response
    const response: WisdomResponse = {
      success: raw?.success ?? true,
      domain: raw?.domain ?? (resolvedSemantic.domain as AIDomain) ?? AIDomain.GENERAL,
      primaryAction: raw?.primaryAction ?? {
        name: resolvedSemantic.action?.type ?? "UNKNOWN",
        confidence: resolvedSemantic.confidence ?? 0,
      },
      summary: raw?.summary ?? raw?.reply ?? raw?.message ?? "",
      artifacts: Array.isArray(raw?.artifacts) ? raw.artifacts : [],
      metadata: raw?.metadata,
    };

    return response;
  }

private normalizeBookingIntent(
  semantic: SemanticContext
): SemanticContext {

  const location =
    semantic.entities.find(
      e => e.type === EntityType.LOCATION
    );

  const listingId =
    semantic.entities.find(
      e => e.type === EntityType.LISTING_ID
    );

  if (
    semantic.action?.type === AgentAction.CREATE_BOOKING &&
    location &&
    !listingId
  ) {

    return new SemanticContext(
      semantic.rawInput,
      semantic.entities,
      {
        type: AgentAction.SEARCH_LISTING,
        confidence: semantic.action.confidence,
      },
      semantic.confidence,
      AIDomain.LISTING,
      semantic.isRuleMatched,
    );
  }

  return semantic;
}
}
