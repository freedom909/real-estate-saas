import { container } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";
import { CategoryRepository } from "@/shared/category/infrastructure/category.repository";

import GetListingByIdUseCase from "@/core/listing/application/usecase/getListingById.usecase";
import CreateListingUseCase from "@/core/listing/application/usecase/createListing.usecase";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import { UploadImageUseCase } from "@/core/listing/application/usecase/uploadImages.usecase";

import { MinioStorage } from "@/core/listing/infrastructure/storage/minio.storage";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";



export const resolvers = {

  Query: {

    listings: async () => {

      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      const listings = await repo.findAll();
      return listings.map(listing => ({
        id: listing.id,
        ownerId: listing.ownerId,
        locationId: listing.locationId,
        title: listing.title,
        description: listing.description,
        address: listing.address,
        price: listing.price,
        pricePerNight: listing.pricePerNight,
        numOfBeds: listing.numOfBeds,
        numOfCustomers: listing.numOfCustomers,
        numOfBathrooms: listing.numOfBathrooms,
        numOfRooms: listing.numOfRooms,
        isFeatured: listing.isFeatured,
        categories: listing.categories ?? [],
        amenityIds: listing.amenityIds ?? [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        pictures: listing.pictures.map(pic => pic.toJson()),
      }));

    },
    listing: async (
      _: any,
      { id }: { id: string }
    ) => {

      const useCase =
        container.resolve<GetListingByIdUseCase>(
          TOKENS_LISTING.usecase.getListingByIdUseCase
        );


      return useCase.execute(id);

    },

    categories: async () => {
      const repo = container.resolve<CategoryRepository>(TOKENS_CATEGORY.categoryRepository);
      const cats = await repo.findAll();
      return cats.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
      }));
    },

  },

  Upload: GraphQLUpload,

  Mutation: {

    createListing: async (_: any, { input }: any, context: any) => {
      console.log("========== CREATE LISTING ==========");
      console.log("input.picture =", input.picture);
      console.log("picture length =", input.picture?.length);
      console.log("context.user =", context.user);
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const ownerId = context.user.userId;
      const useCase = container.resolve<CreateListingUseCase>(
          TOKENS_LISTING.usecase.createListingUseCase
        );
      return await useCase.execute({...input, ownerId});
    },

    uploadImage: async (_: any, { files }: any, context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const usecase=container.resolve<UploadImageUseCase>(TOKENS_PICTURE.usecase.uploadImageUseCase)
      return await usecase.execute(files)
    },
  },
    Listing: {
      __resolveReference: async (ref: { id: string }) => {
        const useCase = container.resolve<GetListingByIdUseCase>(TOKENS_LISTING.usecase.getListingByIdUseCase);
        try {
          return await useCase.execute(ref.id);
        } catch {
          console.warn('⚠️ Missing listing:', ref.id);
          return null;
        }
      },
      owner: (parent: any) => ({
        __typename: "User",
        id: parent.ownerId
      }),

      categories: (parent: any) =>
        parent.categories?.map(
          (id: string) => ({
            __typename: "Category",
            id
          })
        ) ?? [],

      amenities: (parent: any) =>
        parent.amenityIds?.map(
          (id: number) => ({
            __typename: "Amenity",
            id
          })
        ) ?? [],
    },
    Picture: {
      url: async (parent: any) => {
        // Return direct URL since bucket is public
        const minioStorage = container.resolve<MinioStorage>(TOKENS_PICTURE.storage.minioStorage);
        return await minioStorage.getUrl(parent.objectKey)
      },
      mimeType: (parent: any) => {
        return parent.mimeType;
      }
    },
  }
