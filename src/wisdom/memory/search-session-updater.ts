import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "./session/session-memory.store";
import { MemoryContext } from "./type/memory-context";
import { Artifact } from "./booking/artifact-transition-mapper";
import { ArtifactType } from "../shared/enums/artifact-type.enum";

@injectable()
export class SearchSessionUpdater {

    constructor(
        @inject(WISDOM_TOKENS.memory.sessionStore)
        private readonly sessionStore: MemorySessionStore,
    ) {}

    apply(
        ctx: MemoryContext,
        artifact: Artifact,
    ) {

        if (artifact.type !== ArtifactType.LISTING_SEARCH_RESULT) {
            return;
        }

        this.sessionStore.saveSearchResults(
            ctx,
            artifact.content.listings,
        );
    }
}