import { injectable } from "tsyringe";
import { AIContext } from "../contracts/ai-context";
import { sessionMemory } from "./session-memory";

@injectable()
export class BookingStateUpdater {

  apply(context: AIContext, artifact: any): void {

    if (!artifact) return;

    const sessionId = context.identity.sessionId;

    // 读取已有 Memory
    const memory = sessionMemory.get(sessionId) ?? {};

    switch (artifact.type) {

      case "LISTING_SEARCH_RESULT": {

    const listings = artifact.content.listings;

    memory.searchResults = listings;

    context.resources.searchResults = listings;

    sessionMemory.set(sessionId, memory);

    console.log(
        "💾 Saved search results:",
        listings.length,
        "results"
    );

    break;
}

        memory.searchResults = artifact.content.results;
const listings = artifact?.content?.listings ?? [];

memory.searchResults = listings;

console.log(
    "Saved search results:",
    listings.length
);
        context.resources.searchResults = artifact.content.results;

        sessionMemory.set(sessionId, memory);

        console.log(
          "💾 Saved search results:",
          artifact.content,
          "results"
        );

        break;

      case "BOOKING":

        memory.booking = {
          ...(memory.booking ?? {}),
          ...artifact.content,
        };

        context.resources.booking = memory.booking;

        sessionMemory.set(sessionId, memory);

        break;
    }

    console.log(
      "MEMORY AFTER SAVE",
      sessionMemory.get(sessionId)
    );
  }
}