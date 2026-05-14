import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";

export class ListingAISuggestionMapper {
  static toDomain(raw: any): ListingAISuggestion {
    return new ListingAISuggestion({
      id: raw.id,

      listingId: raw.listingId,

      type: raw.type,

      prompt: raw.prompt,

      suggestion: raw.suggestion, // Maps suggestion text to suggestion property

      status: raw.status, // Maps status enum to status property

      model: raw.model,

      createdAt: raw.createdAt,
    });
  }

  static toPersistence(entity: ListingAISuggestion) {
    return {
      id: entity.id,

      listingId: entity.listingId,

      type: entity.type,

      prompt: entity.prompt,

      suggestion: entity.suggestion, // ← string

      status: entity.status, // ← enum

      model: entity.model,

      createdAt: entity.createdAt,
    };
  }
}