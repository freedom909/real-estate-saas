// memory/booking-state.updater.ts

import { injectable } from "tsyringe";
import { AIContext } from "@/ai-platform/context/types/context/ai.context";

@injectable()
export class BookingStateUpdater {

  apply(
    context: AIContext,
    artifact: any
  ) {

    if (!artifact || artifact.type !== "BOOKING") {
      return;
    }

    context.resources.booking = {
      ...context.resources.booking,
      ...artifact.content
    };
  }
}