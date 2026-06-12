import { Listing } from "../../domain/entities/listing";
import { Description } from "../../domain/value-objects/description";
import { Title } from "../../domain/value-objects/Title";


export class ListingMapper {

static toDomain(raw: any): Listing {
 console.log("RAW LISTING++", raw)
  
  return new Listing({
    rawTitle: raw.title,

    id: raw.id,

    hostId: raw.hostId,
    locationId: raw.locationId,

    title:
      new Title(raw.title),

    description:
      new Description(
        raw.description
      ),

    address: raw.address,

categories:
  raw.categories ?? [],

amenityIds:
  raw.amenityIds ?? [],

    numOfBeds:
      raw.numOfBeds ?? 1,

    numOfGuests:
      raw.numOfGuests ?? 1,

    numOfBathrooms:
      raw.numOfBathrooms ?? 1,

    numOfRooms:
      raw.numOfRooms ?? 1,

    price:
      Number(raw.price ?? 1),

    picture:
      raw.picture ?? [],

    isFeatured:
      raw.isFeatured ?? false,

    createdAt:
      raw.createdAt,

    updatedAt:
      raw.updatedAt,

      
  });
  
}

  // DB → Domain
// static toDomain(raw: any): Listing {
//   return new Listing({
//     id: raw.id,

//     hostId: raw.hostId,
//     locationId: raw.locationId,

//     title: new Title(raw.title),

//     description: new Description(raw.description),

//     address: raw.address,

//     categories: raw.categories || [],
//     amenityIds: raw.amenityIds || [],

//     numOfBeds: raw.numOfBeds || 1,
//     numOfGuests: raw.numOfGuests || 1,
//     numOfBathrooms: raw.numOfBathrooms || 1,
//     numOfRooms: raw.numOfRooms || 1,

//     price: Number(raw.price || 1),

//     picture: raw.picture || [],

//     isFeatured: raw.isFeatured || false,

//     createdAt: raw.createdAt,
//     updatedAt: raw.updatedAt,
//   });
// }

  // Domain → DB 
static toPersistence(listing: Listing) {
  return {
    id: listing.id,

title: listing.title,
description: listing.description,

    hostId: listing.hostId,
    locationId: listing.locationId,

    address: listing.address,

    numOfBeds: listing.numOfBeds,
    numOfGuests: listing.numOfGuests,
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