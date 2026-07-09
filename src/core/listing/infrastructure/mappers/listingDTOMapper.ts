// src/subgraphs/listing/infrastructure/mappers/listingDTOMapper.ts

import { Listing } from "../../domain/entities/listing";

export class ListingDTOMapper {
  static toDTO(listing: Listing) {
    return {
      id: listing.id,

      title: listing.title,

      description: listing.description,

      address: listing.address,

      hostId: listing.hostId,

      locationId: listing.locationId,

      categories: listing.categories,

      amenityIds: listing.amenityIds,

      numOfBeds: listing.numOfBeds,

      numOfCustomers: listing.numOfCustomers,

      numOfBathrooms: listing.numOfBathrooms,

      numOfRooms: listing.numOfRooms,

      price: listing.price,

      picture: listing.picture,

      isFeatured: listing.isFeatured,

      createdAt: listing.createdAt,

      updatedAt: listing.updatedAt,
    };
  }
}