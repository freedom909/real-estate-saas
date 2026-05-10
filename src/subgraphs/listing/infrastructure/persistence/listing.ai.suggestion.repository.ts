// listing.ai.suggestion.repository.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";


@injectable()
export class ListingAISuggestionRepository implements IListingAISuggestionRepository {
    constructor(
        @inject(TOKENS_AI.ListingAISuggestionModel)
        private model: typeof ListingAISuggestionModel,
    ) {}
    async findByListingId(listingId: string): Promise<ListingAISuggestion[]> {
        throw new Error("Method not implemented.");
    }
async save(suggestion: ListingAISuggestion) {
  await ListingAISuggestionModel.create({
    ...suggestion,
    listingId: suggestion.listingId,
    type: suggestion.type,
    prompt: suggestion.prompt,
    suggestion: suggestion.suggestion,
  });
}

}