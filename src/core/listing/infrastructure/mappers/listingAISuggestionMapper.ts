import { ListingAISuggestion } from "../../domain/entities/listingAI.suggestion";

export class ListingAISuggestionMapper {
  static toDomain(persistence: any) {
    return ListingAISuggestion.create({
      title: persistence.title,
      description: persistence.description,
      seo: persistence.seo || [],
      tips: persistence.tips || [],
    });
  }

  static toPersistence(entity: ListingAISuggestion) {
    return {
      title: entity.title,
      description: entity.description,
      seo: entity.seo,
      tips: entity.tips,
    };
  }
}