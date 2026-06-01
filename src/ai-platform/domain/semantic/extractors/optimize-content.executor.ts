import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";

import { TOKENS_AI }
from "@/modules/tokens/ai.tokens";

import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";

@injectable()
export class OptimizeContentExecutor {

  constructor(
    @inject(
      TOKENS_AI.usecase
        .generateTitleSuggestionUseCase
    )
    private generateTitleSuggestionUseCase:
      GenerateTitleSuggestionUseCase
  ) {}

  async execute(
    semantic: SemanticContext
  ) {

const listingId =
  semantic.entities.find(
    e =>
      e.type ===
      "listing.id"
  )?.value;
console.log(
  "semantic.entities",
  semantic.entities
);
    if (!listingId) {
      return {
        reply:
          "Listing ID not found."
      };
    }

    const suggestion =
      await this
        .generateTitleSuggestionUseCase
        .execute(listingId);

    return {
      reply: suggestion
    };
  }
}