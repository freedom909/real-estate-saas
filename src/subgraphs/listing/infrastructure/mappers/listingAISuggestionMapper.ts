// listingAISuggestionMapper.ts

import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import ListingAISuggestionModel from "../models/listing.ai.suggestion.model";

export class ListingAISuggestionMapper {
    

    static toPersistence(
        suggestion: ListingAISuggestion
    ) {
        return {
            id: suggestion.id,
            listingId: suggestion.listingId,
            type: suggestion.type,
            prompt: suggestion.prompt,
            suggestion: suggestion.suggestion,
            model: suggestion.model,
            createdAt: suggestion.createdAt,
            updatedAt: new Date(),
        } as unknown as typeof ListingAISuggestionModel;
    }
}