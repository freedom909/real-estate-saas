import { Listing } from '../../domain/entities/listing';


export class ListingMapper {
  static toDomain(raw: Listing): Listing {
    return new Listing({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      address: raw.address,
      categories: raw.categories,
      amenityIds: raw.amenityIds,
      tenantId: raw.tenantId,
    });
  }

  static toPersistence(listing: Listing): any {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      address: listing.address,
      categories: listing.categories,
      amenityIds: listing.amenityIds,
      tenantId: listing.tenantId,
    };
  }
}