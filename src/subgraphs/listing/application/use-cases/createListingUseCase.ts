import { injectable, inject } from 'tsyringe';
import { Listing } from '../../domain/entities/listing';

import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';

export interface CreateListingInput {
  title: string;
  description?: string;
  address: string;
  categories: string[];
  amenityIds?: string[];
  tenantId: string;
}

@injectable()
export default class CreateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository
  ) {}

  async execute(input: CreateListingInput): Promise<Listing> {
    const listing = new Listing({
      title: input.title,
      description: input.description,
      address: input.address,
      categories: input.categories,
      amenityIds: input.amenityIds,
      tenantId: input.tenantId,
    });

    return this.repo.save(listing);
  }
}