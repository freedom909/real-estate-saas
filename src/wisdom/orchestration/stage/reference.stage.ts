// src/wisdom/orchestration/reference.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { IReferenceResolver } from "../../contracts/reference-resolver";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { getCachedSearchResults } from "../../memory/search-results-cache";

@injectable()
export class ReferenceStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.referenceResolver)
    private resolver: IReferenceResolver,
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    if (!ctx.semantic) return ctx;

    // Reload search results from global cache
    const cached = getCachedSearchResults(ctx.memoryContext.sessionId);
    if (cached.length > 0 && (!ctx.request.context.resources.searchResults || ctx.request.context.resources.searchResults.length === 0)) {
      ctx.request.context.resources.searchResults = cached;
    }

    ctx.resolvedSemantic = await this.resolver.resolve(
      ctx.semantic,
      ctx.request.context
    );

    return ctx;
  }
}
