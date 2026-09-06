// src/core/listing/application/usecase/getListingById.usecase.ts

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

if (!listing) return null;

return {

id: listing.id,

ownerId: listing.ownerId,

title: listing.title,

description: listing.description,

amenityIds: listing.amenityIds,

locationId: listing.locationId,

categoryIds: listing.categoryIds,

isFeatured: listing.isFeatured,

pictures: listing.pictures.map(pic => ({
  ...pic.toJson(),
})),

pricePerNight: listing.pricePerNight,

numOfBeds: listing.numOfBeds,

numOfCustomers: listing.numOfCustomers,

numOfBathrooms: listing.numOfBathrooms,

numOfRooms: listing.numOfRooms,
createdAt: listing.createdAt,
updatedAt: listing.updatedAt,
}
}}

export default GetListingByIdUseCase;