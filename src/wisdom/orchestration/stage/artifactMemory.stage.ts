// src/wisdom/orchestration/artifactMemory.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { BookingStateUpdater } from "../../memory/booking-state-updater";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";

@injectable()
export class ArtifactMemoryStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.memory.bookingStateUpdater)
    private bookingStateUpdater: BookingStateUpdater
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    const artifacts = ctx.rawResult?.artifacts ?? [];

    for (const artifact of artifacts) {
      this.bookingStateUpdater.apply(ctx.memoryContext, artifact);
    }

    return ctx;
  }
}