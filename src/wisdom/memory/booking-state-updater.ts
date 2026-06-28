import { injectable } from "tsyringe";

import { MemoryContext } from "./type/memory-context";

interface MemoryArtifact {
  type: string;
  content: any;
}
@injectable()
export class BookingStateUpdater {

    apply(
        memory: MemoryContext,
        artifact: MemoryArtifact 
    ): void {

        switch (artifact.type) {

            case "LISTING_SEARCH_RESULT": {

                const listings =
                    artifact.content.listings ?? [];

                memory.session.searchResults =
                    listings;

                break;
            }

            case "BOOKING": {

                memory.session.booking = {

                    ...(memory.session.booking ?? {}),

                    ...artifact.content

                };

                break;
            }
        }
    }
}