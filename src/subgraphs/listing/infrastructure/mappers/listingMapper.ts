// FILE: src/subgraphs/listing/infrastructure/mappers/ListingMapper.ts

import { Listing } from '../../domain/entities/listing';
import { Category } from '../../domain/entities/category';


export class ListingMapper {
  public static toDomain(raw: any): Listing {
    return new Listing({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      categories: raw.Categories?.map((c: any) => new Category({ id: c.id, name: c.name, type: c.type })) || [],
      amenityIds: raw.Amenities?.map((a: any) => a.id) || [],
      locationIds: raw.Locations?.map((l: any) => l.id) || [],
    });
  }

  public static toPersistence(listing: Listing) {
    return {
      id: listing.id,
      title: listing.title,
      // Mapping for join tables happens in repository
    };
  }
}