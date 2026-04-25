import { injectable, inject } from "tsyringe";
import { Listing } from "../../domain/entities/Listing";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { ListingMapper } from "../../infrastructure/mappers/listing.mapper";

@injectable()
export class ListingRepository {
  constructor(
    @inject(TOKENS_LISTING.ListingModel)
    private model: any
  ) {}

  async findById(id: string): Promise<Listing | null> {
    const raw = await this.model.findByPk(id);

    if (!raw) return null;

    return ListingMapper.toDomain(raw);
  }

  async save(listing: Listing): Promise<Listing> {
    const data = ListingMapper.toPersistence(listing);

    await this.model.upsert(data);

    return listing;
  }
}