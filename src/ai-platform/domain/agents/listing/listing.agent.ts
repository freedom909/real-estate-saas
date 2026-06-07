import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

import { SEOAnalysisUseCase } from "@/subgraphs/listing/application/use-cases/seoAnalysisUseCase";
import { SemanticContext } from "../../semantic/semantic-context";
import { UserContext } from "../../semantic/types/userContext";
import { AIContext } from "../../types/context/aiContext";

import { GenerateDescriptionSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateDescriptionSuggestionUseCase";

@injectable()
export class ListingAgent
  implements IDomainAgent {

  constructor(

    @inject(TOKENS_AI.usecase.generateOptimizeTitleUseCase)
    private titleUseCase:GenerateOptimizeTitleUseCase,

    @inject(TOKENS_AI.usecase.generateDescriptionSuggestionUseCase)
    private descriptionUseCase:GenerateDescriptionSuggestionUseCase,
    @inject(
      TOKENS_AI.usecase.seoAnalysisUseCase
    )
    private seoUseCase:
      SEOAnalysisUseCase

  ) { }

  async execute(
    semantic: SemanticContext,
    context: AIContext
  ) {
    console.log(
      "LISTING AGENT START"
    );
    const listingId = context?.resources?.listingId;

    if (!listingId) {
      throw new Error(
        "Listing context required"
      );
    }
    console.log(semantic);
    const intent =
      semantic.getTopIntent();

    switch (intent) {

      case "OPTIMIZE_TITLE":

        const listingId =
          semantic.entities.find(
            e =>
              e.type === "listing_id" ||
              e.type === "listingid"
          )?.value;

        if (!listingId) {
          throw new Error(
            "Listing ID entity required"
          );
        }

        console.log(
          "LISTING AGENT OPTIMIZE_TITLE",
          listingId
        );

        console.log(
          "BEFORE TITLE USECASE"
        );

        const result =
          await this.titleUseCase.execute(
            context?.resources?.listingId ||
            listingId
          );

        console.log(
          "AFTER TITLE USECASE",
          result
        );

        return result;
    }
  }
}