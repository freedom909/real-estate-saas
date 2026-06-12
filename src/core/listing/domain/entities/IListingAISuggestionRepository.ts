// listingAISuggestionRepository.ts

import { ListingAISuggestion } from "./listingAI.suggestion";



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