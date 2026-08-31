import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("uuid", () => ({ v4: jest.fn(() => "uuid-mock") }));

jest.mock("@/modules/tokens/listing.tokens", () => ({
  TOKENS_LISTING: {
    repos: { listingRepository: Symbol.for("ListingRepository") },
    adapters: { amenityAdapter: Symbol.for("AmenityAdapter") },
  },
}));

jest.mock("@/modules/tokens/category.tokens", () => ({
  TOKENS_CATEGORY: { categoryRepository: Symbol.for("CategoryRepository") },
}));

jest.mock("@/modules/tokens/picture.tokens", () => ({
  TOKENS_PICTURE: {
    usecase: { uploadImageUseCase: Symbol.for("UploadImageUseCase") },
    storage: { minioStorage: Symbol.for("MinioStorage") },
    repos: { pictureRepository: Symbol.for("PictureRepository") },
  },
}));

jest.mock("@/core/listing/application/usecase/uploadImages.usecase", () => ({
  UploadImageUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn<any>().mockResolvedValue([]),
  })),
}));

jest.mock("@/core/listing/infrastructure/storage/minio.storage", () => ({
  MinioStorage: jest.fn(),
}));

jest.mock("@/core/listing/domain/entities/IListingRepository", () => ({
  IListingRepository: jest.fn(),
}));

jest.mock("@/core/listing/domain/repositories/picture.repository", () => ({}));
jest.mock("@/shared/category/domain/ICategory.repository", () => ({}));
jest.mock("@/core/listing/domain/value-objects/Title", () => ({
  Title: jest.fn().mockImplementation((v: string) => ({ getValue: () => v.trim() })),
}));
jest.mock("@/core/listing/domain/value-objects/description", () => ({
  Description: jest.fn().mockImplementation((v: string) => ({ getValue: () => v.trim() })),
}));
jest.mock("@/core/listing/domain/entities/picture", () => ({
  Picture: jest.fn().mockImplementation((props: any) => props),
}));
jest.mock("@/core/listing/domain/entities/listing", () => ({
  Listing: jest.fn().mockImplementation((props: any) => props),
}));

import CreateListingUseCase, {
  CreateListingInput,
} from "@/core/listing/application/usecase/createListing.usecase";

function makeValidInput(overrides: Partial<CreateListingInput> = {}): CreateListingInput {
  return {
    title: "Cozy Tokyo Apartment",
    description: "A lovely small apartment in central Tokyo.",
    address: "1-1-1 Shibuya, Tokyo",
    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 2,
    price: 12000,
    isFeatured: false,
    locationId: "loc-tokyo",
    categories: [],
    amenityIds: [],
    ownerId: "owner-1",
    pictures: [],
    ...overrides,
  };
}

describe("CreateListingUseCase input validation", () => {
  let useCase: CreateListingUseCase;
  let listingRepo: any;
  let amenityAdapter: any;
  let categoryRepo: any;
  let uploadImageUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    listingRepo = { save: jest.fn<any>().mockResolvedValue({ id: "uuid-mock" }) };
    amenityAdapter = { getValidIds: jest.fn<any>().mockResolvedValue([]) };
    categoryRepo = { findByIds: jest.fn<any>().mockResolvedValue([]) };
    uploadImageUseCase = { execute: jest.fn<any>().mockResolvedValue([]) };
    useCase = new (CreateListingUseCase as any)(
      listingRepo,
      amenityAdapter,
      categoryRepo,
      uploadImageUseCase
    );
  });

  describe("rejects invalid price", () => {
    it("rejects negative price (e.g. -100)", async () => {
      await expect(
        useCase.execute(makeValidInput({ price: -100 }))
      ).rejects.toThrow("price must be greater than 0");
    });

    it("rejects zero price", async () => {
      await expect(
        useCase.execute(makeValidInput({ price: 0 }))
      ).rejects.toThrow("price must be greater than 0");
    });

    it("rejects NaN / Infinity price", async () => {
      await expect(
        useCase.execute(makeValidInput({ price: NaN as any }))
      ).rejects.toThrow("price must be greater than 0");
      await expect(
        useCase.execute(makeValidInput({ price: Infinity as any }))
      ).rejects.toThrow("price must be greater than 0");
    });
  });

  describe("rejects invalid numeric counts", () => {
    it("rejects negative numOfBeds", async () => {
      await expect(
        useCase.execute(makeValidInput({ numOfBeds: -1 }))
      ).rejects.toThrow("numOfBeds must be a non-negative integer");
    });

    it("rejects fractional numOfCustomers", async () => {
      await expect(
        useCase.execute(makeValidInput({ numOfCustomers: 2.5 as any }))
      ).rejects.toThrow("numOfCustomers must be a non-negative integer");
    });

    it("rejects negative numOfBathrooms", async () => {
      await expect(
        useCase.execute(makeValidInput({ numOfBathrooms: -2 }))
      ).rejects.toThrow("numOfBathrooms must be a non-negative integer");
    });

    it("rejects non-integer numOfRooms", async () => {
      await expect(
        useCase.execute(makeValidInput({ numOfRooms: 1.337 as any }))
      ).rejects.toThrow("numOfRooms must be a non-negative integer");
    });
  });

  describe("rejects empty required string fields", () => {
    it("rejects empty / whitespace title", async () => {
      await expect(
        useCase.execute(makeValidInput({ title: "" }))
      ).rejects.toThrow("title must be a non-empty string");
      await expect(
        useCase.execute(makeValidInput({ title: "   " }))
      ).rejects.toThrow("title must be a non-empty string");
    });

    it("rejects empty description", async () => {
      await expect(
        useCase.execute(makeValidInput({ description: "" }))
      ).rejects.toThrow("description must be a non-empty string");
    });

    it("rejects empty address", async () => {
      await expect(
        useCase.execute(makeValidInput({ address: "" }))
      ).rejects.toThrow("address must be a non-empty string");
    });

    it("rejects empty locationId", async () => {
      await expect(
        useCase.execute(makeValidInput({ locationId: "" }))
      ).rejects.toThrow("locationId must be a non-empty string");
    });

    it("rejects empty ownerId", async () => {
      await expect(
        useCase.execute(makeValidInput({ ownerId: "" }))
      ).rejects.toThrow("ownerId must be a non-empty string");
    });
  });

  describe("rejects malformed categories", () => {
    it("rejects categories not an array", async () => {
      await expect(
        useCase.execute(makeValidInput({ categories: "hotel" as any }))
      ).rejects.toThrow("categories must be an array");
    });
  });

  describe("allows valid input through (happy path)", () => {
    it("saves a listing when all fields are valid and categories/amenities are empty", async () => {
      const input = makeValidInput();
      const result = await useCase.execute(input);
      expect(listingRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ id: "uuid-mock" });
    });

    it("allows zero counts (numOfBeds=0 is acceptable, e.g. a couch stay)", async () => {
      const input = makeValidInput({
        numOfBeds: 0,
        numOfCustomers: 1,
        numOfBathrooms: 0,
        numOfRooms: 0,
      });
      await useCase.execute(input);
      expect(listingRepo.save).toHaveBeenCalled();
    });
  });
});
