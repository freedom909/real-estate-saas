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
import GetFeaturedListingsUseCase from "@/core/listing/application/usecase/getFeaturedListings.usecase";
import UpdateListingUseCase from "@/core/listing/application/usecase/updateListing.usecase";
import ListingActor from "@/core/listing/application/usecase/listingActor";
import { Role } from "@/core/shared/domain/role";


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
        pricePerNight: listing.pricePerNight,
        numOfBeds: listing.numOfBeds,
        numOfCustomers: listing.numOfCustomers,
        numOfBathrooms: listing.numOfBathrooms,
        numOfRooms: listing.numOfRooms,
        isFeatured: listing.isFeatured,
        categoryIds: listing.categoryIds,
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

    listingsByOwner: async (
      _: any,
      { ownerId }: { ownerId: string }
    ) => {
      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      const listings = await repo.findByOwnerId(ownerId);

      return listings.map(listing => ({
        id: listing.id,
        ownerId: listing.ownerId,
        locationId: listing.locationId,
        title: listing.title,
        description: listing.description,
        pricePerNight: listing.pricePerNight,
        numOfBeds: listing.numOfBeds,
        numOfCustomers: listing.numOfCustomers,
        numOfBathrooms: listing.numOfBathrooms,
        numOfRooms: listing.numOfRooms,
        isFeatured: listing.isFeatured,
        categoryIds: listing.categoryIds,
        amenityIds: listing.amenityIds ?? [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        pictures: listing.pictures.map(pic => pic.toJson()),
      }));
    },
  },

  Mutation: {
    createListing: async (
      _: any,
      { input }: any,
      context: any
    ) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }

      const userId: string = context.user.userId;
      const role: Role = context.user.role;

      const isAdmin =
        role === "ADMIN" ||
        role === "SUPER_ADMIN";

      const resolvedOwnerId: string =
        isAdmin
          ? (input.ownerId || userId)
          : userId;

      const { categories, ...rest } = input;

      const enrichedInput = {
        ...rest,
        categoryIds: categories,
        ownerId: resolvedOwnerId,
      };

      const useCase =
        container.resolve<CreateListingUseCase>(
          TOKENS_LISTING.usecase.createListingUseCase
        );

      return await useCase.execute(
        enrichedInput,
        role
      );
    },

    updateListing: async ( _: any, { input }: any,context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }

      const useCase =
        container.resolve<UpdateListingUseCase>(
          TOKENS_LISTING.usecase.updateListingUseCase
        );

      const {
        id,
        categories,
        ...rest
      } = input;

      const updateInput = {
        ...rest,
        ...(categories !== undefined && {
          categoryIds: categories,
        }),
      };

      const actor: ListingActor = {
        userId: context.user.userId,
        role: context.user.role,
      };

      return await useCase.execute(
        id,
        updateInput,
        actor
      );
    },
  },

  Listing: {
    __resolveReference: async (
      ref: { id: string }
    ) => {
      const useCase =
        container.resolve<GetListingByIdUseCase>(
          TOKENS_LISTING.usecase.getListingByIdUseCase
        );

      try {
        return await useCase.execute(ref.id);
      } catch {
        console.warn(
          "⚠️ Missing listing:",
          ref.id
        );
        return null;
      }
    },

    owner: (parent: any) => ({
      __typename: "User",
      id: parent.ownerId,
    }),

    categories: (parent: any) =>
      parent.categoryIds?.map((id: string) => ({
        __typename: "Category",
        id,
      })) ?? [],
  },

  Upload: GraphQLUpload,

  Picture: {
    url: async (parent: any) => {
      const minioStorage =
        container.resolve<MinioStorage>(
          TOKENS_PICTURE.storage.minioStorage
        );

      return await minioStorage.getUrl(
        parent.objectKey
      );
    },

    mimeType: (parent: any) =>
      parent.mimeType,
  },
};
