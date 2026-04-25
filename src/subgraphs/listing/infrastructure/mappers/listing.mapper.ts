import { Listing } from "../../domain/entities/Listing";

export class ListingMapper {
  // DB → Domain
  static toDomain(raw: any): Listing {
    return new Listing({
      id: raw.id,
      tenantId: raw.tenantId,
      title: raw.title,
      description: raw.description,
      
      
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      address: raw.address,
      categories: raw.categories,
      amenityIds: raw.amenityIds,
    });
  }

  // Domain → DB
  static toPersistence(listing: Listing) {
    return {
      id: listing.id,
      tenantId: listing.tenantId,
      title: listing.title,
      description: listing.description,

    };
  }
}