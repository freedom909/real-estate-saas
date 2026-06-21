import { inject, injectable } from "tsyringe";

import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";

import { AgentRouterService } from "./router/agentRouter.service";
import { ISemanticExtractor } from "../semantic/types/i-semantic.extractor";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";
import { AgentResult } from "@/ai-platform/context/types/context/agent.result";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/semantic/extractor";
import { AIDomain } from "../semantic/types/ai.domain";

@injectable()
export class AIPlatformOrchestrator {

  constructor(

    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: ISemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.agentRouterService)
    private routingService: AgentRouterService

  ) { }
  async handle(
    request: AIRequest
  ): Promise<AgentResult> {

    const semantic =
      await this.semanticExtractor.extract(
        request
      );

    const agent =
      this.routingService.route(
        semantic
      );

    console.log("🔍 Agent resolved:", agent?.constructor?.name ?? "NULL/UNDEFINED");

    let raw;
    try {
      raw = await agent.execute(semantic, request.context);
    } catch (err) {
      console.error("❌ Agent.execute() FAILED:", err);
      throw err;
    }
    console.log("AGENT RESULT++",
      Object.keys(raw)
    );

    // Normalize: ensure every agent result conforms to AgentResult shape.
    // Agents may return partial objects (e.g. { reply } or use-case results
    // without `artifacts`). GraphQL schema requires `artifacts: [Artifact!]!`.
    const result: AgentResult = {
      success: raw?.success ?? true,
      domain: raw?.domain ?? (semantic.domain as AIDomain) ?? AIDomain.GENERAL,
      primaryAction: raw?.primaryAction ?? {
        name: semantic.action?.type ?? "UNKNOWN",
        confidence: semantic.confidence ?? 0,
      },
      summary: raw?.summary ?? raw?.reply ?? raw?.message ?? "",
      artifacts: Array.isArray(raw?.artifacts) ? raw.artifacts : [],
      metadata: raw?.metadata,
    };

    return result;
  }
}
