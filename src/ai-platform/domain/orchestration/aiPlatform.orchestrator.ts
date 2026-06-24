import { inject, injectable } from "tsyringe";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";

import { AgentRouterService } from "./router/agentRouter.service";
import { ISemanticExtractor } from "../semantic/types/i-semantic.extractor";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";
import { AgentResult } from "@/ai-platform/context/types/context/agent.result";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/semantic/extractor";
import { AIDomain } from "../semantic/types/ai.domain";
import { ReferenceResolver } from "@/ai-platform/reference/referenceResolver";
import { TOKENS_REFERENCE } from "@/ai-platform/container/reference/reference.token";
import { BookingStateUpdater } from "@/ai-platform/memory/booking-state.updater";
import { TOKENS_MEMORY } from "@/ai-platform/container/memory/memory.token";

@injectable()
export class AIPlatformOrchestrator {

  constructor(

    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: ISemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.agentRouterService)
    private routingService: AgentRouterService,
   
    @inject(TOKENS_REFERENCE.resolver)
    private referenceResolver: ReferenceResolver,

    @inject(TOKENS_MEMORY.bookingStateUpdater)
    private bookingStateUpdater: BookingStateUpdater,
  ) {}
async handle(request: AIRequest): Promise<AgentResult> {

  const semantic =
    await this.semanticExtractor.extract(request);

  console.log("SEMANTIC >>>", semantic);

  const resolvedSemantic =
    await this.referenceResolver.resolve(
      semantic,
      request.context
    );

  const agent =
    this.routingService.route(resolvedSemantic);

  console.log(
    "🔍 Agent resolved:",
    agent?.constructor?.name ?? "NULL"
  );

  let raw;

  try {
    raw =
      await agent.execute(
        resolvedSemantic,
        request.context
      );
  } catch (err) {
    console.error("❌ Agent.execute() FAILED:", err);
    throw err;
  }

  // 🔥 STEP 1: extract artifact AFTER execution
  const artifact = raw?.artifacts?.[0];

  // 🔥 STEP 2: update memory AFTER execution
  if (artifact) {
    this.bookingStateUpdater.apply(
      request.context,
      artifact
    );
  }

  const result: AgentResult = {
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

  return result;
}
}
