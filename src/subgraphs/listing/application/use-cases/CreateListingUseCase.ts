import { randomUUID } from 'crypto';
import { injectable, inject } from 'tsyringe';
import { Listing } from '../../domain/entities/Listing';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';
import { Title } from '../../domain/value-objects/Title';
import { Description } from '../../domain/value-objects/Description';
import { IAmenityAdapter } from '../../adapters/IAmenity.adapter';
import { ICategoryRepository } from '@/shared/category/domain/ICategoryRepository';
import { TOKENS_CATEGORY } from '@/modules/tokens/category.tokens';

export interface CreateListingInput {
  title: string;
  description: string;
  address: string;
  numOfBeds?: number;
  numOfGuests?: number;
  numOfBathrooms?: number;
  numOfRooms?: number;
  price?: number;
  picture?: string[];
  isFeatured?: boolean;
  locationId: string;
  categories: string[];
  amenityIds?: string[];
  hostId: string;
}

@injectable()
export default class CreateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private listingRepository: IListingRepository,
    @inject(TOKENS_LISTING.adapters.amenityAdapter)
    private amenityAdapter: IAmenityAdapter,
    @inject(TOKENS_CATEGORY.categoryRepository)
    private categoryRepo: ICategoryRepository,
  ) {}

  async execute(input: CreateListingInput): Promise<Listing> {
    const categoryIds = input.categories ?? [];
    if (categoryIds.length === 0) {
      throw new Error('At least one category is required');
    }

    const categories = await this.categoryRepo.findByIds(categoryIds);
    const foundCategoryIds = new Set(categories.map(category => category.id));
    const invalidCategoryIds = categoryIds.filter(id => !foundCategoryIds.has(id));

    if (invalidCategoryIds.length > 0) {
      throw new Error(`Invalid category IDs: ${invalidCategoryIds.join(', ')}`);
    }

    const amenityIds = input.amenityIds ?? [];
    if (amenityIds.length > 0) {
      const validAmenityIds = await this.amenityAdapter.getValidIds(amenityIds);
      const validAmenityIdSet = new Set(validAmenityIds);
      const invalidAmenityIds = amenityIds.filter(id => !validAmenityIdSet.has(id));

      if (invalidAmenityIds.length > 0) {
        throw new Error(`Invalid amenity IDs: ${invalidAmenityIds.join(', ')}`);
      }
    }

    const listing = new Listing({
      id: randomUUID(),
      address: input.address,
      title: new Title(input.title),
      description: new Description(input.description),
      locationId: input.locationId,
      categories: categoryIds,
      amenityIds,
      hostId: input.hostId,
      createdAt: new Date(),
      updatedAt: new Date(),
      numOfBeds: input.numOfBeds ?? 1,
      numOfGuests: input.numOfGuests ?? 1,
      numOfBathrooms: input.numOfBathrooms ?? 1,
      numOfRooms: input.numOfRooms ?? 1,
      price: input.price ?? 1,
      picture: input.picture ?? [],
      isFeatured: input.isFeatured ?? false,
    });

    return this.listingRepository.save(listing);
  }
}
