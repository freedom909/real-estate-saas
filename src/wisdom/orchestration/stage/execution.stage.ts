// src/wisdom/orchestration/stage/execution.stage.ts

import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";

export class ExecutionStage implements IPipelineStage {
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