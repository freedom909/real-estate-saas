// src/wisdom/memory/booking-state-updater.ts

import { injectable } from "tsyringe";
import { AIContext } from "../contracts/ai-context";

@injectable()
export class BookingStateUpdater {
  apply(context: AIContext, artifact: any): void {
    if (!artifact || artifact.type !== "BOOKING") return;

    context.resources.booking = {
      ...context.resources.booking,
      ...artifact.content,
    };
  }
}
