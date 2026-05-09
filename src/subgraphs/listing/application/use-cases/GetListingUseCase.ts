import { injectable, inject } from "tsyringe";
import { Listing } from "../../domain/entities/Listing";
import { IListingRepository } from "../../domain/repos/IListingRepository";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

@injectable()
class GetListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository
  ) {}

  async execute(id: string): Promise<Listing> {
    const listing = await this.repo.findById(id);
    if (!listing) throw new Error("Listing not found");

    return listing;
  }
}

export default GetListingUseCase;
