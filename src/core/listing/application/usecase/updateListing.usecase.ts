import { injectable, inject } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository } from "../../domain/entities/IListingRepository";

import { Title } from "../../domain/value-objects/Title";
import { Description } from "../../domain/value-objects/description";

import { Listing } from "../../domain/entities/listing";
import { Picture } from "../../domain/entities/picture";

import { Action, Resource } from "@/rbac/types";
import { IPolicyEngine } from "@/rbac/policyContext";

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

    @inject(TOKENS_LISTING.policyEngine)
    private policyEngine: IPolicyEngine,
  ) {}

  async execute(
    id: string,
    input: UpdateListingInput,
    actor: ListingActor,
  ) {
    const existing = await this.listingRepository.findById(id);

    if (!existing) {
      throw new Error(`Listing not found: ${id}`);
    }

    const allow = this.policyEngine.can(
      Action.UPDATE,
      Resource.LISTING,
      {
        user: {
          id: actor.userId,
          role: actor.role,
        },
        resourceOwnerId: existing.ownerId,
      },
    );

    if (!allow) {
      throw new Error(
        `Listing not allowed to update listing`
      );
    }

    const updated = new Listing({
      id: existing.id,

      ownerId: existing.ownerId,

      locationId:
        input.locationId ??
        existing.locationId,

      title: new Title(
        input.title ??
        existing.title
      ),

      description: new Description(
        input.description ??
        existing.description
      ),

      categoryIds:
        input.categoryIds ??
        existing.categoryIds,

      amenityIds:
        input.amenityIds ??
        existing.amenityIds,

      numOfBeds:
        input.numOfBeds ??
        existing.numOfBeds,

      numOfCustomers:
        input.numOfCustomers ??
        existing.numOfCustomers,

      numOfBathrooms:
        input.numOfBathrooms ??
        existing.numOfBathrooms,

      numOfRooms:
        input.numOfRooms ??
        existing.numOfRooms,

      pricePerNight:
        input.pricePerNight ??
        existing.pricePerNight,

      pictures:
        input.pictures ??
        existing.pictures,

      isFeatured:
        input.isFeatured ??
        existing.isFeatured,

      createdAt:
        existing.createdAt,

      updatedAt:
        new Date(),
    });

    const success =
      await this.listingRepository.update(
        id,
        updated
      );

    if (!success) {
      throw new Error(
        `Failed to update listing: ${id}`
      );
    }

    return updated;
  }
}