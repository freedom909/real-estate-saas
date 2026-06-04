import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { GenerateTitleSuggestionUseCase } from "@/subgraphs/listing/application/use-cases/generateTitleSuggestionUseCase";
import { SEOAnalysisUseCase } from "@/subgraphs/listing/application/use-cases/seoAnalysisUseCase";
import { SemanticContext } from "../../semantic/semantic-context";
import { UserContext } from "../../semantic/types/userContext";


//
@injectable()
export class ListingAgent
  implements IDomainAgent {

  constructor(

    @inject(
      TOKENS_AI.usecase
        .generateTitleSuggestionUseCase
    )
    private titleUseCase:
      GenerateTitleSuggestionUseCase,

    @inject(
      TOKENS_AI.usecase.seoAnalysisUseCase
    )
    private seoUseCase:
      SEOAnalysisUseCase

  ) { }

  async execute(
    semantic: SemanticContext,
    user: UserContext
  ) {
    console.log(
      "LISTING AGENT START"
    );
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
      user?.resources?.listingId ||
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