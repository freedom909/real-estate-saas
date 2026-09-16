import { injectable, inject } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
class GetListingsUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) {}

  async execute() {
    const listings = await this.repo.findAll();

    if (!listings) {
      throw new Error("Listing not found");
    }

    return listings.map((listing) => ({
      id: listing.id,
      ownerId: listing.ownerId,
      title: listing.title,
      description: listing.description,
      amenityIds: listing.amenityIds,
      locationId: listing.locationId,
      categoryIds: listing.categoryIds,
      isFeatured: listing.isFeatured,
      pictures: listing.pictures,
      pricePerNight: listing.pricePerNight,
      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      numOfBathrooms: listing.numOfBathrooms,
      numOfRooms: listing.numOfRooms,
    }));
  }
}

export default GetListingsUseCase;