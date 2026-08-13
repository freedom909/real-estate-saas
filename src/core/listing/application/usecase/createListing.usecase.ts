import { inject, injectable } from "tsyringe";
import { Listing } from "../../domain/entities/listing";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { Title } from "../../domain/value-objects/Title";
import { Description } from "../../domain/value-objects/description";

import { ICategoryRepository } from "@/shared/category/domain/ICategory.repository";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IAmenityAdapter } from "../adapters/IAmenityAdapter";
import { Picture } from "../../domain/entities/picture";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { UploadImageUseCase } from "./uploadImages.usecase";

interface CreateImageInput {
  objectKey: string;
  mimeType: string;
  size: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  address: string;
  numOfBeds: number;
  numOfCustomers: number;
  numOfBathrooms: number;
  numOfRooms: number;
  price: number;
  pictures?: CreateImageInput[];
  files?: any[];
  isFeatured: boolean;
  locationId: string;
  categories: string[];
  amenityIds?: number[];
  ownerId: string;
}

interface GenerateTitleResult {
  id: string;
}

@injectable()
export default class CreateListingUseCase {
  constructor(
    @inject(TOKENS_LISTING.repos.listingRepository)
    private listingRepository: IListingRepository,
    @inject(TOKENS_LISTING.adapters.amenityAdapter)
    private amenityAdapter: IAmenityAdapter,
    @inject(TOKENS_CATEGORY.categoryRepository)
    private categoryRepo: ICategoryRepository,
    @inject(TOKENS_PICTURE.usecase.uploadImageUseCase)
    private uploadImageUseCase: UploadImageUseCase
  ) { }

  async execute(input: CreateListingInput): Promise<any> {
    if (input.amenityIds && input.amenityIds.length > 0) {
      const validIds = await this.amenityAdapter.getValidIds(input.amenityIds);
      const validSet = new Set(validIds);
      const invalidAmenityIds = input.amenityIds.filter(id => !validSet.has(id));
      if (invalidAmenityIds.length > 0) {
        throw new Error(`Invalid amenity IDs provided: ${invalidAmenityIds.join(', ')}`);
      }
    }
    const categories = await this.categoryRepo.findByIds(input.categories);
    if (categories.length === 0 && input.categories.length > 0) {
      throw new Error(`Invalid category names provided: ${input.categories.join(', ')}`);
    }
    const foundIds = new Set(categories.map(c => c.id));
    const invalidCategories = input.categories.filter(id => !foundIds.has(id));
    if (invalidCategories.length > 0) {
      throw new Error(`Invalid category IDs: ${invalidCategories.join(", ")}`);
    }

    const validAmenityIds = await this.amenityAdapter.getValidIds(input.amenityIds || []);
    const invalidAmenities = (input.amenityIds || []).filter(
      id => !validAmenityIds.includes(id)
    );
    if (invalidAmenities.length > 0) {
      throw new Error(`Invalid amenity IDs: ${invalidAmenities.join(", ")}`);
    }

    const listingId = uuidv4();

    let pictures: Picture[] = (input.pictures ?? []).map((pic, index) =>
      new Picture({
        id: uuidv4(),
        listingId,
        objectKey: pic.objectKey,
        mimeType: pic.mimeType,
        size: pic.size,
        type: "listing",
        sortOrder: index,
      })
    );

    if (input.files && input.files.length > 0) {
      const uploaded = await this.uploadImageUseCase.execute(input.files, listingId);
      pictures = [...pictures, ...uploaded];
    }

    const listing = new Listing({
      id: listingId,
      title: new Title(input.title),
      description: new Description(input.description),
      address: input.address,
      numOfBeds: input.numOfBeds,
      numOfCustomers: input.numOfCustomers,
      numOfBathrooms: input.numOfBathrooms,
      numOfRooms: input.numOfRooms,
      price: input.price,
      isFeatured: input.isFeatured,
      locationId: input.locationId,
      categories: input.categories,
      amenityIds: input.amenityIds || [],
      pictures,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: input.ownerId,
    });

    return this.listingRepository.save(listing);
  }
}
