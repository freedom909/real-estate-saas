// src/wisdom/orchestration/execution.stage.ts


import { injectable } from "tsyringe";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";

@injectable()
export class PipelineStageImp implements IPipelineStage { 
  async execute(ctx: WisdomPipelineContext) { 
    if (!ctx.agent || !ctx.resolvedSemantic) return ctx;
    console.log(
      "Before",
      ctx.constructor.name,
      ctx.memoryContext
    );
    ctx.rawResult = await ctx.agent.execute(
      ctx.resolvedSemantic,
      ctx.request.context
    );

    return ctx;
  }
}