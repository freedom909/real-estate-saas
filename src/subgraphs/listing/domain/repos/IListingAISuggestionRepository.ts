// listingAISuggestionRepository.ts

import { ListingAISuggestion } from "../entities/listingAISuggestion";

export interface IListingAISuggestionRepository {
  save(
    suggestion: ListingAISuggestion
  ): Promise<void>;

  findById(
    suggestionId: string
  ): Promise<ListingAISuggestion>;

  findByListingId(
    listingId: string
  ): Promise<ListingAISuggestion[]>;

}