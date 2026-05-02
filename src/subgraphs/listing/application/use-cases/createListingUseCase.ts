import { injectable, inject } from 'tsyringe';
import { Listing } from '../../domain/entities/Listing';
import { v4 as uuidv4 } from 'uuid';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';
import { Title } from '../../domain/value-objects/Title';
import { Description } from '../../domain/value-objects/Description';

export interface CreateListingInput {
  title: string;
  description: string;
  locationId: string;
  categories: string[];
  amenityIds?: string[];
  hostId: string;
}

@injectable()
export default class CreateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: IListingRepository
  ) {}

  async execute(input: CreateListingInput): Promise<Listing> {
    // Production logic: Any cross-domain validation would happen here via adapters
    const listing = new Listing({
      title: new Title(input.title),
      description: new Description(input.description),
      locationId: input.locationId,
      categories: input.categories,
      amenityIds: input.amenityIds,
      hostId: input.hostId,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uuidv4(),
    });

    return this.repo.save(listing);
  }
}
