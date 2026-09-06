// src/subgraphs/listing/infrastructure/mappers/listingDTOMapper.ts

import { Listing } from "../../domain/entities/listing";

export class ListingDTOMapper {
  static toDTO(listing: Listing) {
    return {
      id: listing.id,

      title: listing.title,

      description: listing.description,

      ownerId: listing.ownerId,

      locationId: listing.locationId,

      categoryIds: listing.categoryIds,

      amenityIds: listing.amenityIds || [],

      numOfBeds: listing.numOfBeds,

      numOfCustomers: listing.numOfCustomers,

      numOfBathrooms: listing.numOfBathrooms,

      numOfRooms: listing.numOfRooms,

      pricePerNight: listing.pricePerNight,

      pictures: listing.pictures.map((p) => p.id),

      isFeatured: listing.isFeatured,

      createdAt: listing.createdAt,

      updatedAt: listing.updatedAt,
    };
  }
}