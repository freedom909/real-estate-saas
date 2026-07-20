import { injectable, inject } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
class GetFeaturedListingsUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) {}

  async execute(limit: number = 6) {
    const listings = await this.repo.findFeatured(limit);
    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      address: listing.address,
      price: listing.price,
      picture: listing.picture,
      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      isFeatured: listing.isFeatured,
    }));
  }
}

export default GetFeaturedListingsUseCase;
