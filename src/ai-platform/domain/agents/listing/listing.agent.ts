import { inject, injectable } from "tsyringe";

import { IDomainAgent }
  from "../../semantic/types/IDomainAgent";

import { SemanticContext }
  from "../../semantic/semantic-context";



import {
  GenerateDescriptionSuggestionUseCase
} from "@/subgraphs/listing/application/use-cases/generateDescriptionSuggestionUseCase";

import {
  SEOAnalysisUseCase
} from "@/subgraphs/listing/application/use-cases/seoAnalysisUseCase";

import {
  TOKENS_LISTING
} from "@/modules/tokens/listing.tokens";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";

import { AIContext } from "@/ai-platform/context/types/context/aiContext";

@injectable()
export class ListingAgent
  implements IDomainAgent {

  constructor(
    @inject(TOKENS_LISTING.usecase
      .generateTitleSuggestionUseCase)
    private readonly titleUseCase:
      GenerateTitleSuggestionUseCase,

    @inject(TOKENS_LISTING.usecase.generateDescriptionSuggestionUseCase)
    private readonly descriptionUseCase:GenerateDescriptionSuggestionUseCase,

    @inject(TOKENS_LISTING.usecase
      .seoAnalysisUseCase)
    private readonly seoUseCase:
      SEOAnalysisUseCase

  ) {}

  async execute(
    semantic: SemanticContext,
    context: AIContext
  ) {

 console.log(
  "📌 ListingAgent",
  semantic.action.type
);

    const listingId =
      semantic.entities.find(
        e =>
          e.type === "listing_id"
      )?.value;

    if (!listingId) {
      throw new Error(
        "Listing ID not found in semantic context."
      );
    }


const action =
  semantic.action?.type;




switch (action) {

  case "OPTIMIZE_TITLE":

    return await this.titleUseCase.execute(
      listingId
    );

  case "OPTIMIZE_DESCRIPTION":

    return await this.descriptionUseCase.execute(
      listingId
    );

  case "SEO_ANALYSIS":

    return await this.seoUseCase.execute(
      listingId
    );

  default:

    throw new Error(
      `Unsupported action: ${action}`
    );
}
}
}