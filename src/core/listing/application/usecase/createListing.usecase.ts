import { inject, injectable } from "tsyringe";
import { Listing } from "../../domain/entities/listing";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { IListingRepository } from "../../domain/entities/IListingRepository";
import { Title } from "../../domain/value-objects/Title";
import { Description } from "../../domain/value-objects/description";

import { ICategoryRepository } from "@/shared/category/domain/ICategory.repository";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IAmenityAdapter } from "../adapters/IAmenity.adapter";
import { Picture } from "../../domain/entities/picture";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { UploadImageUseCase } from "./uploadImages.usecase";
import { IPolicyEngine } from "@/rbac/policyContext";
import ListingActor from "./listingActor";
import { Action, Resource } from "@/rbac/types";

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
    private uploadImageUseCase: UploadImageUseCase,
  ) { }
  
  private validateInput(input: CreateListingInput): void {
    if (!Number.isFinite(input.price) || input.price <= 0) {
      throw new Error("price must be greater than 0");
    }
    if (!Number.isFinite(input.numOfBeds) || input.numOfBeds < 0 || !Number.isInteger(input.numOfBeds)) {
      throw new Error("numOfBeds must be a non-negative integer");
    }
    if (!Number.isFinite(input.numOfCustomers) || input.numOfCustomers < 0 || !Number.isInteger(input.numOfCustomers)) {
      throw new Error("numOfCustomers must be a non-negative integer");
    }
    if (!Number.isFinite(input.numOfBathrooms) || input.numOfBathrooms < 0 || !Number.isInteger(input.numOfBathrooms)) {
      throw new Error("numOfBathrooms must be a non-negative integer");
    }
    if (!Number.isFinite(input.numOfRooms) || input.numOfRooms < 0 || !Number.isInteger(input.numOfRooms)) {
      throw new Error("numOfRooms must be a non-negative integer");
    }
    if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
      throw new Error("title must be a non-empty string");
    }
    if (!input.description || typeof input.description !== "string" || input.description.trim().length === 0) {
      throw new Error("description must be a non-empty string");
    }
    if (!input.address || typeof input.address !== "string" || input.address.trim().length === 0) {
      throw new Error("address must be a non-empty string");
    }
    if (!input.locationId || typeof input.locationId !== "string" || input.locationId.trim().length === 0) {
      throw new Error("locationId must be a non-empty string");
    }
    if (!input.ownerId || typeof input.ownerId !== "string" || input.ownerId.trim().length === 0) {
      throw new Error("ownerId must be a non-empty string");
    }
    if (!Array.isArray(input.categories)) {
      throw new Error("categories must be an array");
    }
  }

  async execute(input: CreateListingInput, role: string): Promise<any> {
    if (role !== "HOST") {
      throw new Error("User is not allowed to create a listing");
    }
    this.validateInput(input);
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
