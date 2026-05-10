// listingAISuggestionRepository.ts

import { ListingAISuggestion } from "../entities/listingAISuggestion";

export interface IListingAISuggestionRepository {
  save(
    suggestion: ListingAISuggestion
  ): Promise<void>;

  findByListingId(
    listingId: string
  ): Promise<ListingAISuggestion[]>;
}