
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-mock"),
}));

jest.mock("@/modules/tokens/listing.tokens", () => ({
  TOKENS_LISTING: {
    repos: {
      listingRepository: Symbol.for("ListingRepository"),
    },
    adapters: {
      amenityAdapter: Symbol.for("AmenityAdapter"),
    },
  },
}));

jest.mock("@/modules/tokens/category.tokens", () => ({
  TOKENS_CATEGORY: {
    categoryRepository: Symbol.for("CategoryRepository"),
  },
}));

jest.mock("@/modules/tokens/picture.tokens", () => ({
  TOKENS_PICTURE: {
    usecase: {
      uploadImageUseCase: Symbol.for("UploadImageUseCase"),
    },
  },
}));

jest.mock(
  "@/core/listing/application/usecase/uploadImages.usecase",
  () => ({
    UploadImageUseCase: jest
      .fn()
      .mockImplementation(() => ({
        execute: jest.fn<any>().mockResolvedValue([]),
      })),
  }),
);

jest.mock(
  "@/core/listing/infrastructure/storage/minio.storage",
  () => ({
    MinioStorage: jest.fn(),
  }),
);

jest.mock(
  "@/core/listing/domain/entities/IListingRepository",
  () => ({
    IListingRepository: jest.fn(),
  }),
);

jest.mock(
  "@/shared/category/domain/ICategory.repository",
  () => ({}),
);

jest.mock(
  "@/core/listing/domain/value-objects/Title",
  () => ({
    Title: jest.fn().mockImplementation((value: string) => ({
      getValue: () => value.trim(),
    })),
  }),
);

jest.mock(
  "@/core/listing/domain/value-objects/description",
  () => ({
    Description: jest
      .fn()
      .mockImplementation((value: string) => ({
        getValue: () => value.trim(),
      })),
  }),
);

jest.mock(
  "@/core/listing/domain/entities/picture",
  () => ({
    Picture: jest.fn().mockImplementation((props: any) => props),
  }),
);

jest.mock(
  "@/core/listing/domain/entities/listing",
  () => ({
    Listing: jest.fn().mockImplementation((props: any) => props),
  }),
);

import CreateListingUseCase, {
  CreateListingInput,
} from "@/core/listing/application/usecase/createListing.usecase";

function makeValidInput(
  overrides: Partial<CreateListingInput> = {},
): CreateListingInput {
  return {
    title: "Cozy Tokyo Apartment",
    description: "A lovely small apartment in central Tokyo.",

    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 2,

    pricePerNight: 12000,

    pictures: [],
    files: [],

    isFeatured: false,

    locationId: "loc-tokyo",

    categoryIds: [],

    amenityIds: [],

    tenantId: "tenant-kyoto",
    ownerId: "owner-1",

    ...overrides,
  };
}

describe("CreateListingUseCase", () => {
  let useCase: CreateListingUseCase;

  let listingRepository: any;
  let amenityAdapter: any;
  let categoryRepository: any;
  let uploadImageUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    listingRepository = {
      create: jest.fn<any>().mockResolvedValue({
        id: "uuid-mock",
      }),
    };

    amenityAdapter = {
      getValidIds: jest.fn<any>().mockResolvedValue([]),
    };

    categoryRepository = {
      findByIds: jest.fn<any>().mockResolvedValue([]),
    };

    uploadImageUseCase = {
      execute: jest.fn<any>().mockResolvedValue([]),
    };

    useCase = new (CreateListingUseCase as any)(
      listingRepository,
      amenityAdapter,
      categoryRepository,
      uploadImageUseCase,
    );
  });

  // ============================================================
  // Input validation
  // ============================================================

  describe("input validation", () => {
    describe("pricePerNight", () => {
      it("rejects negative pricePerNight", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              pricePerNight: -100,
            }),
          ),
        ).rejects.toThrow(
          "pricePerNight must be greater than 0",
        );
      });

      it("rejects zero pricePerNight", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              pricePerNight: 0,
            }),
          ),
        ).rejects.toThrow(
          "pricePerNight must be greater than 0",
        );
      });

      it("rejects NaN pricePerNight", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              pricePerNight: NaN,
            }),
          ),
        ).rejects.toThrow(
          "pricePerNight must be greater than 0",
        );
      });

      it("rejects Infinity pricePerNight", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              pricePerNight: Infinity,
            }),
          ),
        ).rejects.toThrow(
          "pricePerNight must be greater than 0",
        );
      });

      it("accepts a positive pricePerNight", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              pricePerNight: 1,
            }),
          ),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });

    describe("numOfBeds", () => {
      it("rejects negative numOfBeds", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBeds: -1,
            }),
          ),
        ).rejects.toThrow(
          "numOfBeds must be a non-negative integer",
        );
      });

      it("rejects fractional numOfBeds", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBeds: 1.5,
            }),
          ),
        ).rejects.toThrow(
          "numOfBeds must be a non-negative integer",
        );
      });

      it("rejects NaN numOfBeds", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBeds: NaN,
            }),
          ),
        ).rejects.toThrow(
          "numOfBeds must be a non-negative integer",
        );
      });

      it("accepts zero numOfBeds", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBeds: 0,
            }),
          ),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });

    describe("numOfCustomers", () => {
      it("rejects negative numOfCustomers", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfCustomers: -1,
            }),
          ),
        ).rejects.toThrow(
          "numOfCustomers must be a non-negative integer",
        );
      });

      it("rejects fractional numOfCustomers", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfCustomers: 2.5,
            }),
          ),
        ).rejects.toThrow(
          "numOfCustomers must be a non-negative integer",
        );
      });

      it("accepts zero numOfCustomers", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfCustomers: 0,
            }),
          ),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });

    describe("numOfBathrooms", () => {
      it("rejects negative numOfBathrooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBathrooms: -1,
            }),
          ),
        ).rejects.toThrow(
          "numOfBathrooms must be a non-negative integer",
        );
      });

      it("rejects fractional numOfBathrooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBathrooms: 1.5,
            }),
          ),
        ).rejects.toThrow(
          "numOfBathrooms must be a non-negative integer",
        );
      });

      it("accepts zero numOfBathrooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfBathrooms: 0,
            }),
          ),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });

    describe("numOfRooms", () => {
      it("rejects negative numOfRooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfRooms: -1,
            }),
          ),
        ).rejects.toThrow(
          "numOfRooms must be a non-negative integer",
        );
      });

      it("rejects fractional numOfRooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfRooms: 1.337,
            }),
          ),
        ).rejects.toThrow(
          "numOfRooms must be a non-negative integer",
        );
      });

      it("accepts zero numOfRooms", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              numOfRooms: 0,
            }),
          ),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });

    describe("title", () => {
      it("rejects an empty title", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              title: "",
            }),
          ),
        ).rejects.toThrow(
          "title must be a non-empty string",
        );
      });

      it("rejects a whitespace-only title", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              title: "   ",
            }),
          ),
        ).rejects.toThrow(
          "title must be a non-empty string",
        );
      });
    });

    describe("description", () => {
      it("rejects an empty description", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              description: "",
            }),
          ),
        ).rejects.toThrow(
          "description must be a non-empty string",
        );
      });

      it("rejects a whitespace-only description", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              description: "   ",
            }),
          ),
        ).rejects.toThrow(
          "description must be a non-empty string",
        );
      });
    });

    describe("locationId", () => {
      it("rejects an empty locationId", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              locationId: "",
            }),
          ),
        ).rejects.toThrow(
          "locationId must be a non-empty string",
        );
      });

      it("rejects a whitespace-only locationId", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              locationId: "   ",
            }),
          ),
        ).rejects.toThrow(
          "locationId must be a non-empty string",
        );
      });
    });

    describe("ownerId", () => {
      it("rejects an empty ownerId", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              ownerId: "",
            }),
          ),
        ).rejects.toThrow(
          "ownerId must be a non-empty string",
        );
      });

      it("rejects a whitespace-only ownerId", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              ownerId: "   ",
            }),
          ),
        ).rejects.toThrow(
          "ownerId must be a non-empty string",
        );
      });
    });

    describe("categoryIds", () => {
      it("rejects categoryIds when it is not an array", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              categoryIds: "hotel" as any,
            }),
          ),
        ).rejects.toThrow(
          "categoryIds must be an array",
        );
      });
    });

    describe("amenityIds", () => {
      it("rejects amenityIds when it is not an array", async () => {
        await expect(
          useCase.execute(
            makeValidInput({
              amenityIds: "1" as any,
            }),
          ),
        ).rejects.toThrow(
          "amenityIds must be an array",
        );
      });

      it("accepts undefined amenityIds", async () => {
        const input = makeValidInput({
          amenityIds: undefined,
        });

        await expect(
          useCase.execute(input),
        ).resolves.toEqual({
          id: "uuid-mock",
        });
      });
    });
  });

  // ============================================================
  // Category validation
  // ============================================================

  describe("category validation", () => {
    it("accepts an empty categoryIds array", async () => {
      categoryRepository.findByIds.mockResolvedValue([]);

      await expect(
        useCase.execute(
          makeValidInput({
            categoryIds: [],
          }),
        ),
      ).resolves.toEqual({
        id: "uuid-mock",
      });

      expect(
        categoryRepository.findByIds,
      ).toHaveBeenCalledWith([]);
    });

    it("accepts valid category IDs", async () => {
      categoryRepository.findByIds.mockResolvedValue([
        { id: "category-1" },
        { id: "category-2" },
      ]);

      const result = await useCase.execute(
        makeValidInput({
          categoryIds: [
            "category-1",
            "category-2",
          ],
        }),
      );

      expect(
        categoryRepository.findByIds,
      ).toHaveBeenCalledWith([
        "category-1",
        "category-2",
      ]);

      expect(result).toEqual({
        id: "uuid-mock",
      });
    });

    it("rejects when one category ID does not exist", async () => {
      categoryRepository.findByIds.mockResolvedValue([
        { id: "category-1" },
      ]);

      await expect(
        useCase.execute(
          makeValidInput({
            categoryIds: [
              "category-1",
              "category-missing",
            ],
          }),
        ),
      ).rejects.toThrow(
        "Invalid category IDs: category-missing",
      );
    });

    it("rejects when all category IDs are invalid", async () => {
      categoryRepository.findByIds.mockResolvedValue([]);

      await expect(
        useCase.execute(
          makeValidInput({
            categoryIds: [
              "category-1",
              "category-2",
            ],
          }),
        ),
      ).rejects.toThrow(
        "Invalid category IDs: category-1, category-2",
      );
    });
  });

  // ============================================================
  // Amenity validation
  // ============================================================

  describe("amenity validation", () => {
    it("does not validate amenities when amenityIds is empty", async () => {
      await useCase.execute(
        makeValidInput({
          amenityIds: [],
        }),
      );

      expect(
        amenityAdapter.getValidIds,
      ).not.toHaveBeenCalled();
    });

    it("accepts valid amenity IDs", async () => {
      amenityAdapter.getValidIds.mockResolvedValue([
        1,
        2,
      ]);

      const result = await useCase.execute(
        makeValidInput({
          amenityIds: ["1", "2"],
        }),
      );

      expect(
        amenityAdapter.getValidIds,
      ).toHaveBeenCalledWith([1, 2]);

      expect(result).toEqual({
        id: "uuid-mock",
      });
    });

    it("rejects invalid amenity IDs", async () => {
      amenityAdapter.getValidIds.mockResolvedValue([
        1,
      ]);

      await expect(
        useCase.execute(
          makeValidInput({
            amenityIds: ["1", "2"],
          }),
        ),
      ).rejects.toThrow(
        "Invalid amenity IDs: 2",
      );
    });
  });

  // ============================================================
  // Picture creation
  // ============================================================

  describe("picture creation", () => {
    it("creates Picture entities from input pictures", async () => {
      const pictures = [
        {
          objectKey: "listing/image-1.jpg",
          mimeType: "image/jpeg",
          size: 12345,
        },
        {
          objectKey: "listing/image-2.jpg",
          mimeType: "image/jpeg",
          size: 23456,
        },
      ];

      await useCase.execute(
        makeValidInput({
          pictures,
        }),
      );

      expect(listingRepository.create).toHaveBeenCalledTimes(1);

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.pictures).toHaveLength(2);

      expect(listing.pictures[0]).toEqual({
        id: "uuid-mock",
        listingId: "uuid-mock",
        objectKey: "listing/image-1.jpg",
        mimeType: "image/jpeg",
        size: 12345,
        type: "listing",
        sortOrder: 0,
      });

      expect(listing.pictures[1]).toEqual({
        id: "uuid-mock",
        listingId: "uuid-mock",
        objectKey: "listing/image-2.jpg",
        mimeType: "image/jpeg",
        size: 23456,
        type: "listing",
        sortOrder: 1,
      });
    });
  });

  // ============================================================
  // File upload
  // ============================================================

  describe("file upload", () => {
    it("does not call uploadImageUseCase when files are empty", async () => {
      await useCase.execute(
        makeValidInput({
          files: [],
        }),
      );

      expect(
        uploadImageUseCase.execute,
      ).not.toHaveBeenCalled();
    });

    it("uploads files when files are provided", async () => {
      const uploadedPictures = [
        {
          id: "uploaded-picture-1",
          listingId: "uuid-mock",
          objectKey: "listing/uploaded.jpg",
          mimeType: "image/jpeg",
          size: 54321,
          type: "listing",
          sortOrder: 0,
        },
      ];

      uploadImageUseCase.execute.mockResolvedValue(
        uploadedPictures,
      );

      const files = [
        {
          filename: "uploaded.jpg",
          mimetype: "image/jpeg",
        },
      ];

      await useCase.execute(
        makeValidInput({
          files,
        }),
      );

      expect(
        uploadImageUseCase.execute,
      ).toHaveBeenCalledWith(
        files,
        "uuid-mock",
      );

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.pictures).toEqual(
        uploadedPictures,
      );
    });

    it("combines input pictures and uploaded pictures", async () => {
      const uploadedPictures = [
        {
          id: "uploaded-picture-1",
          listingId: "uuid-mock",
          objectKey: "listing/uploaded.jpg",
          mimeType: "image/jpeg",
          size: 54321,
          type: "listing",
          sortOrder: 0,
        },
      ];

      uploadImageUseCase.execute.mockResolvedValue(
        uploadedPictures,
      );

      const inputPictures = [
        {
          objectKey: "listing/existing.jpg",
          mimeType: "image/jpeg",
          size: 11111,
        },
      ];

      await useCase.execute(
        makeValidInput({
          pictures: inputPictures,
          files: [
            {
              filename: "uploaded.jpg",
              mimetype: "image/jpeg",
            },
          ],
        }),
      );

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.pictures).toHaveLength(2);

      expect(listing.pictures[0]).toEqual({
        id: "uuid-mock",
        listingId: "uuid-mock",
        objectKey: "listing/existing.jpg",
        mimeType: "image/jpeg",
        size: 11111,
        type: "listing",
        sortOrder: 0,
      });

      expect(listing.pictures[1]).toEqual(
        uploadedPictures[0],
      );
    });
  });

  // ============================================================
  // Listing creation
  // ============================================================

  describe("listing creation", () => {
    it("creates a listing with tenantId and ownerId", async () => {
      const input = makeValidInput({
        tenantId: "tenant-kyoto",
        ownerId: "owner-1",
      });

      await useCase.execute(input);

      expect(
        listingRepository.create,
      ).toHaveBeenCalledTimes(1);

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.id).toBe("uuid-mock");
      expect(listing.tenantId).toBe("tenant-kyoto");
      expect(listing.ownerId).toBe("owner-1");
      expect(listing.locationId).toBe("loc-tokyo");

      expect(listing.numOfBeds).toBe(2);
      expect(listing.numOfCustomers).toBe(4);
      expect(listing.numOfBathrooms).toBe(1);
      expect(listing.numOfRooms).toBe(2);

      expect(listing.pricePerNight).toBe(12000);
      expect(listing.isFeatured).toBe(false);

      expect(listing.categoryIds).toEqual([]);
      expect(listing.amenityIds).toEqual([]);
    });

    it("passes categoryIds and amenityIds into the listing", async () => {
      categoryRepository.findByIds.mockResolvedValue([
        { id: "category-1" },
        { id: "category-2" },
      ]);

      amenityAdapter.getValidIds.mockResolvedValue([
        10,
        20,
      ]);

      await useCase.execute(
        makeValidInput({
          categoryIds: [
            "category-1",
            "category-2",
          ],
          amenityIds: ["10", "20"],
        }),
      );

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.categoryIds).toEqual([
        "category-1",
        "category-2",
      ]);

      expect(listing.amenityIds).toEqual([
        "10",
        "20",
      ]);
    });

    it("sets createdAt and updatedAt", async () => {
      await useCase.execute(
        makeValidInput(),
      );

      const listing = listingRepository.create.mock
        .calls[0][0];

      expect(listing.createdAt).toBeInstanceOf(Date);
      expect(listing.updatedAt).toBeInstanceOf(Date);
    });

    it("returns the repository-created listing", async () => {
      const savedListing = {
        id: "created-listing-id",
        tenantId: "tenant-kyoto",
        ownerId: "owner-1",
      };

      listingRepository.create.mockResolvedValue(
        savedListing,
      );

      const result = await useCase.execute(
        makeValidInput(),
      );

      expect(result).toBe(savedListing);

      expect(
        listingRepository.create,
      ).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Happy path
  // ============================================================

  describe("happy path", () => {
    it("creates a listing when all fields are valid", async () => {
      const input = makeValidInput();

      const result = await useCase.execute(
        input,
      );

      expect(result).toEqual({
        id: "uuid-mock",
      });

      expect(
        listingRepository.create,
      ).toHaveBeenCalledTimes(1);

      expect(
        categoryRepository.findByIds,
      ).toHaveBeenCalledWith([]);

      expect(
        amenityAdapter.getValidIds,
      ).not.toHaveBeenCalled();
    });

    it("allows zero values for valid non-negative counts", async () => {
      const input = makeValidInput({
        numOfBeds: 0,
        numOfCustomers: 0,
        numOfBathrooms: 0,
        numOfRooms: 0,
      });

      const result = await useCase.execute(
        input,
      );

      expect(result).toEqual({
        id: "uuid-mock",
      });

      expect(
        listingRepository.create,
      ).toHaveBeenCalledTimes(1);
    });
  });
});

