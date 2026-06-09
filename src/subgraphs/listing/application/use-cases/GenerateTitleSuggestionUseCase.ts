// FILE: application/usecases/generateTitleSuggestionUseCase.ts
import { inject, injectable, delay } from "tsyringe"; // Import delay
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";


@injectable()
export class GenerateTitleSuggestionUseCase {

  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private repo: IListingRepository,

    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: IOpenAIAdapter,
  ) { }

  async execute(listingId: string) {

    console.log(
      "STEP 1 listingId",
      listingId
    );

    const listing =
      await this.repo.findById(
        listingId
      );

    console.log(
      "STEP 2 listing",
      listing
    );

    if (!listing) {
      throw new Error(
        "Listing not found"
      );
    }

    console.log(
      "STEP 3 build prompt"
    );

    const prompt = `
Improve this listing title:

Title:
${listing.title}

Description:
${listing.description}
`;

    console.log(
      "STEP 4 call AI"
    );

    const suggestion =
      await this.ai.generateText({
        prompt
      });

    console.log(
      "STEP 5 suggestion",
      suggestion
    );

    return {
      success: true,

      domain: "LISTING",

      primaryAction: "OPTIMIZE_TITLE",

      actions: ["OPTIMIZE_TITLE"],

      summary: "Listing optimization completed",

      artifacts: [
        {
          type: "TITLE",
          content: suggestion
        }
      ]
    };
  }

}