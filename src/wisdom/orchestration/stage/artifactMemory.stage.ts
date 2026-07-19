// src/wisdom/orchestration/artifactMemory.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { BookingStateUpdater } from "../../memory/booking-state-updater";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { IPipelineStage } from "./i-pipeline-stage";
import { cacheSearchResults } from "../../memory/search-results-cache";
import { cacheBookingState } from "../../memory/booking-cache";

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

      // Cache search results globally so next turn can access them
      if (artifact.type === "LISTING_SEARCH_RESULT") {
        const listings = artifact.content?.listings ?? [];
        cacheSearchResults(ctx.memoryContext.sessionId, listings);
        ctx.request.context.resources.searchResults = listings;
      }
    }

    // Cache booking state globally so next turn can detect AWAITING_DATES etc.
    const session = ctx.memoryContext.session;
    if (session?.booking) {
      cacheBookingState(ctx.memoryContext.sessionId, session.booking);
    }

    return ctx;
  }
}
