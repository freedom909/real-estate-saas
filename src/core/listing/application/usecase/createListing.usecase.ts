// src/core/listing/application/usecase/createListing.usecase.ts

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

interface CreateImageInput {
  objectKey: string;
  mimeType: string;
  size: number;
}

export interface CreateListingInput {
  title: string;
  description: string;

  numOfBeds: number;
  numOfCustomers: number;
  numOfBathrooms: number;
  numOfRooms: number;

  pricePerNight: number;

  pictures?: CreateImageInput[];
  files?: any[];

  isFeatured: boolean;

  locationId: string;

  categoryIds: string[];

  amenityIds?: string[];

  ownerId: string;
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
  ) {}

  private validateInput(input: CreateListingInput): void {
    if (
      !Number.isFinite(input.pricePerNight) ||
      input.pricePerNight <= 0
    ) {
      throw new Error("pricePerNight must be greater than 0");
    }

    if (
      !Number.isFinite(input.numOfBeds) ||
      input.numOfBeds < 0 ||
      !Number.isInteger(input.numOfBeds)
    ) {
      throw new Error("numOfBeds must be a non-negative integer");
    }

    if (
      !Number.isFinite(input.numOfCustomers) ||
      input.numOfCustomers < 0 ||
      !Number.isInteger(input.numOfCustomers)
    ) {
      throw new Error("numOfCustomers must be a non-negative integer");
    }

    if (
      !Number.isFinite(input.numOfBathrooms) ||
      input.numOfBathrooms < 0 ||
      !Number.isInteger(input.numOfBathrooms)
    ) {
      throw new Error("numOfBathrooms must be a non-negative integer");
    }

    if (
      !Number.isFinite(input.numOfRooms) ||
      input.numOfRooms < 0 ||
      !Number.isInteger(input.numOfRooms)
    ) {
      throw new Error("numOfRooms must be a non-negative integer");
    }

    if (
      !input.title ||
      typeof input.title !== "string" ||
      input.title.trim().length === 0
    ) {
      throw new Error("title must be a non-empty string");
    }

    if (
      !input.description ||
      typeof input.description !== "string" ||
      input.description.trim().length === 0
    ) {
      throw new Error("description must be a non-empty string");
    }

    if (
      !input.locationId ||
      typeof input.locationId !== "string" ||
      input.locationId.trim().length === 0
    ) {
      throw new Error("locationId must be a non-empty string");
    }

    if (
      !input.ownerId ||
      typeof input.ownerId !== "string" ||
      input.ownerId.trim().length === 0
    ) {
      throw new Error("ownerId must be a non-empty string");
    }

    if (!Array.isArray(input.categoryIds)) {
      throw new Error("categoryIds must be an array");
    }

    if (
      input.amenityIds !== undefined &&
      !Array.isArray(input.amenityIds)
    ) {
      throw new Error("amenityIds must be an array");
    }
  }

  async execute(
    input: CreateListingInput,
    role: string = "HOST",
  ): Promise<Listing> {
    if (
      role !== "HOST" &&
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN"
    ) {
      throw new Error("User is not allowed to create a listing");
    }

    this.validateInput(input);

    // =========================
    // Validate amenities
    // =========================

    const amenityIds = input.amenityIds ?? [];

    if (amenityIds.length > 0) {
      const validAmenityIds =
        await this.amenityAdapter.getValidIds(amenityIds.map(Number));

      const invalidAmenityIds = amenityIds.filter(
        (id) => !validAmenityIds.includes(Number(id)),
      );

      if (invalidAmenityIds.length > 0) {
        throw new Error(
          `Invalid amenity IDs: ${invalidAmenityIds.join(", ")}`,
        );
      }
    }

    // =========================
    // Validate categories
    // =========================

    const categories = await this.categoryRepo.findByIds(
      input.categoryIds,
    );

    const foundIds = new Set(categories.map((category) => category.id));

    const invalidCategories = input.categoryIds.filter(
      (id) => !foundIds.has(id),
    );

    if (invalidCategories.length > 0) {
      throw new Error(
        `Invalid category IDs: ${invalidCategories.join(", ")}`,
      );
    }

    // =========================
    // Create Listing ID
    // =========================

    const listingId = uuidv4();

    // =========================
    // Create Pictures
    // =========================

    let pictures: Picture[] = (input.pictures ?? []).map(
      (pic, index) =>
        new Picture({
          id: uuidv4(),
          listingId,
          objectKey: pic.objectKey,
          mimeType: pic.mimeType,
          size: pic.size,
          type: "listing",
          sortOrder: index,
        }),
    );

    // =========================
    // Upload Files
    // =========================

    if (input.files && input.files.length > 0) {
      const uploaded = await this.uploadImageUseCase.execute(
        input.files,
        listingId,
      );

      pictures = [...pictures, ...uploaded];
    }

    // =========================
    // Create Domain Entity
    // =========================

    const listing = new Listing({
      id: listingId,

      title: new Title(input.title),
      description: new Description(input.description),

      ownerId: input.ownerId,
      locationId: input.locationId,

      categoryIds: input.categoryIds,
      amenityIds,

      numOfBeds: input.numOfBeds,
      numOfCustomers: input.numOfCustomers,
      numOfBathrooms: input.numOfBathrooms,
      numOfRooms: input.numOfRooms,

      pricePerNight: input.pricePerNight,

      pictures,

      isFeatured: input.isFeatured,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // =========================
    // Persist Listing
    // =========================

    return this.listingRepository.create(listing);
  }
}