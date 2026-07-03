// src/wisdom/orchestration/response.stage.ts

import { injectable } from "tsyringe";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";

@injectable()
export class ResponseStage implements IPipelineStage {
  async execute(ctx: WisdomPipelineContext) {
    const raw = ctx.rawResult;

    ctx.response = {
      success: raw?.success ?? true,
      domain: raw?.domain ?? ctx.resolvedSemantic?.domain,
      primaryAction: raw?.primaryAction ?? {
        name: ctx.resolvedSemantic?.action?.type ?? "UNKNOWN",
        confidence: ctx.resolvedSemantic?.confidence ?? 0,
      },
      summary: raw?.summary ?? "",
      artifacts: raw?.artifacts ?? [],
      metadata: {
        durationMs: Date.now() - ctx.startTime,
        executedSteps: raw?.executedSteps ?? [],
      },
    };
    console.log("Response+++:", ctx.response);
    return ctx;
  }
}