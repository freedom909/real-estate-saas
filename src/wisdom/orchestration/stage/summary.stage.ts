// src/wisdom/orchestration/summary.stage.ts



import { inject, injectable } from "tsyringe";
import { SummaryScheduler } from "../../memory/summary/summary-scheduler";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";
import { ConversationTurn } from "../../memory/summary";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";

@injectable()
export class SummaryStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.memory.summaryScheduler)
    private readonly scheduler: SummaryScheduler
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    const artifacts = ctx.rawResult?.artifacts ?? [];

    const userTurn = {
      role: "user",
      content: ctx.request.message,
      timestamp: Date.now(),
    };

    const assistantTurn = {
      role: "assistant",
      content: ctx.rawResult?.summary ?? "",
      timestamp: Date.now(),
      metadata: { artifacts },
    };

    await Promise.all([
      this.scheduler.onTurnComplete(ctx.memoryContext, userTurn as ConversationTurn),// 
      this.scheduler.onTurnComplete(ctx.memoryContext, assistantTurn as ConversationTurn),
    ]);

    return ctx;
  }
}