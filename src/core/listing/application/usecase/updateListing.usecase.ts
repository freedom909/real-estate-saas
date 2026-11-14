// src/core/listing/application/usecase/updateListing.usecase.ts

import { injectable, inject } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository } from "../../domain/entities/IListingRepository";

import { Title } from "../../domain/value-objects/Title";
import { Description } from "../../domain/value-objects/description";

import { Listing } from "../../domain/entities/listing";
import { Picture } from "../../domain/entities/picture";

import ListingActor from "./listingActor";

export interface UpdateListingInput {
  title?: string;
  description?: string;

  locationId?: string;
  categoryIds?: string[];
  amenityIds?: string[];

  numOfBeds?: number;
  numOfCustomers?: number;
  numOfBathrooms?: number;
  numOfRooms?: number;

  pricePerNight?: number;

  pictures?: Picture[];

  isFeatured?: boolean;
}

@injectable()
export default class UpdateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private listingRepository: IListingRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateListingInput,
    _actor?: ListingActor,
  ) {
    const existing =
      await this.listingRepository.findById(id);

    if (!existing) {
      throw new Error(`Listing not found: ${id}`);
    }

    const updated = new Listing({
      id: existing.id,

      // Preserve existing business data
      status: existing.status,
      tenantId: existing.tenantId,
      ownerId: existing.ownerId,

      locationId:
        input.locationId ?? existing.locationId,

      title: new Title(
        input.title ?? existing.title
      ),

      description: new Description(
        input.description ?? existing.description
      ),

      categoryIds:
        input.categoryIds ?? existing.categoryIds,

      amenityIds:
        input.amenityIds ?? existing.amenityIds,

      numOfBeds:
        input.numOfBeds ?? existing.numOfBeds,

      numOfCustomers:
        input.numOfCustomers ?? existing.numOfCustomers,

      numOfBathrooms:
        input.numOfBathrooms ?? existing.numOfBathrooms,

      numOfRooms:
        input.numOfRooms ?? existing.numOfRooms,

      pricePerNight:
        input.pricePerNight ?? existing.pricePerNight,

      pictures:
        input.pictures ?? existing.pictures,

      isFeatured:
        input.isFeatured ?? existing.isFeatured,

      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const success =
      await this.listingRepository.update(id, updated);

    if (!success) {
      throw new Error(`Failed to update listing: ${id}`);
    }

    return updated;
  }
}
