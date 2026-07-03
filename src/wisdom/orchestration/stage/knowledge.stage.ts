// src/wisdom/orchestration/knowledge.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { KnowledgeStore } from "../../memory/knowledge.store";
import { KnowledgeExtractor } from "../../memory/extractor/knowledge.extractor";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";

@injectable()
export class KnowledgeStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.memory.knowledgeExtractor)
    private extractor: KnowledgeExtractor,
    @inject(WISDOM_TOKENS.memory.knowledgeStore)
    private store: KnowledgeStore
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    const knowledge = await this.store.load(ctx.memoryContext);

    const deltas = await this.extractor.extract(
      ctx.resolvedSemantic!,
      ctx.rawResult,
      ctx.request.context,
      knowledge
    );

    if (deltas.length) {
      await this.store.persist(ctx.memoryContext, deltas);
    }

    ctx.knowledge = deltas;

    return ctx;
  }
}