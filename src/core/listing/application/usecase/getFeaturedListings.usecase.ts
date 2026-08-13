import { injectable, inject } from "tsyringe";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import PictureMapper from "../../infrastructure/mappers/picture.mapper";

@injectable()
class GetFeaturedListingsUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private readonly repo: IListingRepository
  ) {}

  async execute(limit: number = 6) {
    const listings = await this.repo.findFeatured(limit);
    console.log("listings++", listings);
    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      address: listing.address,
      price: listing.price,
      pictures: listing.pictures.map(p => PictureMapper.toDomain(p)),
      numOfBeds: listing.numOfBeds,
      numOfCustomers: listing.numOfCustomers,
      isFeatured: listing.isFeatured,
    }));
  }
}

export default GetFeaturedListingsUseCase;
