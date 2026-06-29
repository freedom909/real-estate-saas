//import { injectable, inject, delay } from 'tsyringe';
import { Listing } from '../../domain/entities/listing';
import { v4 as uuidv4 } from 'uuid';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/entities/IListingRepository';
import { Title } from '../../domain/value-objects/Title';
import { Description } from '../../domain/value-objects/description';


// Assuming categoryAdapter token is under TOKENS_LISTING.adapters
import { ICategoryRepository } from '@/shared/category/domain/ICategory.repository';
import { TOKENS_CATEGORY } from '@/modules/tokens/category.tokens';

import { inject, injectable } from 'tsyringe';
import { GenerateTitleResult } from '../ports/generateTitleResult';
import { IAmenityAdapter } from '../adapters/IAmenity.adapter';

export interface CreateListingInput {
  title: string;
  description: string;
  address: string;
  numOfBeds: number;
  numOfGuests: number;
  numOfBathrooms: number;
  numOfRooms: number;
  price: number;
  picture: string[];
  isFeatured: boolean;
  locationId: string;
  categories: string[];
  amenityIds?: string[];
  hostId: string;
}

@injectable()
export default class CreateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private listingRepository: IListingRepository,
    @inject(TOKENS_LISTING.adapters.amenityAdapter)
    private amenityAdapter: IAmenityAdapter,
    @inject(TOKENS_CATEGORY.categoryRepository)
    private categoryRepo: ICategoryRepository,// it should be the 'CategoryRepository' for the ICategoryAdapter   
  ) { }

  async execute(input: CreateListingInput): Promise<GenerateTitleResult> {

    // Validate amenityIds
    if (input.amenityIds && input.amenityIds.length > 0) {
      console.log(input.amenityIds);
      const validIds = await this.amenityAdapter.getValidIds(input.amenityIds);
      console.log("++validIds", validIds); //no output in the terminal
      const validSet = new Set(validIds);
      const invalidAmenityIds = input.amenityIds.filter(id => !validSet.has(id));

      if (invalidAmenityIds.length > 0) {
        throw new Error(`Invalid amenity IDs provided: ${invalidAmenityIds.join(', ')}`);
      }
    }
    const categories = await this.categoryRepo.findByIds(input.categories);

    console.log(categories); //no output in the terminal
    if (categories.length === 0 && input.categories.length > 0) {
      throw new Error(`Invalid category names provided: ${input.categories.join(', ')}`);
    }
    const foundIds = new Set(categories.map(c => c.id));
    const invalidCategories = input.categories.filter(id => !foundIds.has(id));
    if (invalidCategories.length > 0) {
      throw new Error(`Invalid category IDs: ${invalidCategories.join(", ")}`);
    }

    // 2️⃣ 校验 amenities（通过 adapter）
    const validAmenityIds = await this.amenityAdapter.getValidIds(input.amenityIds || []);

    const invalidAmenities = (input.amenityIds || []).filter(
      id => !validAmenityIds.includes(id)
    );

    if (invalidAmenities.length > 0) {
      throw new Error(`Invalid amenity IDs: ${invalidAmenities.join(", ")}`);
    }
    // Production logic: Any cross-domain validation would happen here via adapters
    const listing = new Listing({
      address: input.address,
      title: new Title(input.title),
      description: new Description(input.description),
      locationId: input.locationId,
      rawTitle: input.title,
      categories: input.categories,
      amenityIds: input.amenityIds || [],
      hostId: input.hostId,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uuidv4(),
      numOfBeds: input.numOfBeds || 1,

      numOfGuests: input.numOfGuests || 1,

      numOfBathrooms: input.numOfBathrooms || 1,

      numOfRooms: input.numOfRooms || 1,

      price: input.price || 1,

      picture: input.picture || [],

      isFeatured: input.isFeatured || false,
    });

    return this.listingRepository.save(listing);
  }
}
