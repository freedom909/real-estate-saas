// src/subgraphs/listing/application/usecases/getListingById.usecase.ts

import { injectable, inject } from "tsyringe";

import { IListingRepository } from "../../domain/entities/IListingRepository";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()

class GetListingByIdUseCase {

constructor(

@inject(TOKENS_LISTING.repos.listingRepository)

private readonly repo: IListingRepository

) {}

async execute(id: string) {

const listing = await this.repo.findById(id);

if (!listing) throw new Error("Listing not found");

return {

id: listing.id,

ownerId: listing.ownerId,

title: listing.title,

description: listing.description,

amenityIds: listing.amenityIds,

locationId: listing.locationId,

address: listing.address,

categories: listing.categories,

isFeatured: listing.isFeatured,

picture: listing.picture,

price: listing.price,

numOfBeds: listing.numOfBeds,

numOfCustomers: listing.numOfCustomers,

numOfBathrooms: listing.numOfBathrooms,

numOfRooms: listing.numOfRooms,

};

}

}

export default GetListingByIdUseCase;