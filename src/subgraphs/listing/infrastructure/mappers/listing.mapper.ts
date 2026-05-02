import { Listing } from "../../domain/entities/Listing";
import { Title } from "../../domain/value-objects/Title";
import { Description } from "../../domain/value-objects/Description";

export class ListingMapper {
  // DB → Domain
  static toDomain(raw: any): Listing {
    return new Listing({
      id: raw.id,
      hostId: raw.hostId,
      title: new Title(raw.title),
      description: new Description(raw.description || "No description provided for this listing."),
      locationId: raw.locationId || "UNKNOWN_LOCATION_ID", // Provide a default if missing from DB
      categories: (raw.categories && raw.categories.length > 0) ? raw.categories : ["other"],
      amenityIds: raw.amenityIds || [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,

    });
  }

  // Domain → DB
  static toPersistence(listing: Listing) {
    return {
      id: listing.id,
      hostId: listing.hostId,
      title: listing.title,
      description: listing.description,
      locationId: listing.locationId,
      categories: listing.categories,
      amenityIds: listing.amenityIds,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}