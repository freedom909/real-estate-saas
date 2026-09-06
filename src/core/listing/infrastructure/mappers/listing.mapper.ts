import { Listing } from "../../domain/entities/listing";
import { Description } from "../../domain/value-objects/description";
import { Title } from "../../domain/value-objects/Title";
import PictureMapper from "./picture.mapper";

export class ListingMapper {

  static toDomain(raw: any): Listing {
    return new Listing({
      rawTitle: raw.title,

      id: raw.id,

      ownerId: raw.ownerId,
      locationId: raw.locationId,

      title: new Title(raw.title),

      description:
        new Description(
          raw.description
        ),

      categoryIds:
        raw.categoryIds ?? [],

      amenityIds:
        raw.amenityIds ?? [],

      numOfBeds:
        raw.numOfBeds ?? 1,

      numOfCustomers:
        raw.numOfCustomers ?? 1,

      numOfBathrooms:
        raw.numOfBathrooms ?? 1,

      numOfRooms:
        raw.numOfRooms ?? 1,



      pricePerNight: Number(raw.pricePerNight),

      pictures: raw.pictures?.map((p: any) => PictureMapper.toDomain(p)) ?? [],

      isFeatured:
        raw.isFeatured ?? false,

      createdAt:
        raw.createdAt,

      updatedAt:
        raw.updatedAt,
    });

  }


  // Domain → DB 
  static toPersistence(listing: Listing) {
    return {
      id: listing.id,

      title: listing.title,
      description: listing.description,

      ownerId: listing.ownerId,
      locationId: listing.locationId,

      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      numOfBathrooms: listing.numOfBathrooms,
      numOfRooms: listing.numOfRooms,

      pricePerNight: listing.pricePerNight,

      isFeatured: listing.isFeatured,

      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}