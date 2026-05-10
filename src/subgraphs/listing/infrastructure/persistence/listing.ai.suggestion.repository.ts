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
    ) { }
    async findById(id: string): Promise<ListingAISuggestion> {
        if (!id) {
            throw new Error("id is required");
        }
        const suggestion = await this.model.findByPk(id);// 
        if (!suggestion) {
            throw new Error("suggestion not found");
        }
        return suggestion as unknown as ListingAISuggestion;
    }

    async findByListingId(listingId: string): Promise<ListingAISuggestion[]> {
        throw new Error("Method not implemented.");
    }
    async save(suggestion: ListingAISuggestion) {
        await ListingAISuggestionModel.create({
            ...suggestion,
            id: suggestion.id, // I added this line so that the error message came. 
            listingId: suggestion.listingId,
            type: suggestion.type,
            prompt: suggestion.prompt,
            suggestion: suggestion.suggestion,
        });
    }

}