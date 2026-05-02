//src/subgraphs/listing/services/listing.service.ts
import { injectable, inject } from 'tsyringe';

import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';

import { Listing, ListingProps } from '../domain/entities/Listing';

import { IListingRepository } from '../domain/entities/IListingRepository';
import CreateListingUseCase from '../application/use-cases/CreateListingUseCase';

@injectable()
export class ListingService {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository,
    @inject(TOKENS_LISTING.CreateListingUseCase)
    private createListingUseCase: CreateListingUseCase
  ) {}

  async getListing(id: string): Promise<Listing | null> {
    return this.repo.findById(id);
  }

  async getPropertiesByHost(hostId: string): Promise<Listing[]> {
    return this.repo.findByHostId(hostId);
  }

  async createListing(input: ListingProps): Promise<Listing> {
    return this.createListingUseCase.execute(input as any);
  }
}