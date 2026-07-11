import { injectable, inject, delay } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
class GetListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) {}

  async execute() {
    const listings = await this.repo.findAll();
    console.log("🔥🔥 GET LISTINGS CALLED++", listings);
    if (!listings) throw new Error("Listing not found");
    
    return listings.map((listing) => ({
      id: listing.id,
      ownerId: listing.ownerId,
      title: listing.title,
      description: listing.description,
      amenityIds: listing.amenityIds,
      locationId: listing.locationId,// 位置ID
      address: listing.address,
      categories: listing.categories,
      isFeatured: listing.isFeatured,
      picture: listing.picture,
      price: listing.price,
      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      numOfBathrooms: listing.numOfBathrooms,
      numOfRooms: listing.numOfRooms,
    }));
  }
}

export default GetListingUseCase;