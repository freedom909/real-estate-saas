// src/wisdom/orchestration/reference.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { IReferenceResolver } from "../../contracts/reference-resolver";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";

@injectable()
export class ReferenceStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.referenceResolver)
    private resolver: IReferenceResolver
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    if (!ctx.semantic) return ctx;

    ctx.resolvedSemantic = await this.resolver.resolve(
      ctx.semantic,
      ctx.request.context
    );

    return ctx;
  }
}