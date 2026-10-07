import { container } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";


import GetListingByIdUseCase from "@/core/listing/application/usecase/getListingById.usecase";
import CreateListingUseCase from "@/core/listing/application/usecase/createListing.usecase";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";


import { MinioStorage } from "@/core/listing/infrastructure/storage/minio.storage";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";

import UpdateListingUseCase from "@/core/listing/application/usecase/updateListing.usecase";
import ListingActor from "@/core/listing/application/usecase/listingActor";
import { GlobalRole } from "@/core/shared/domain/role";
import { AuthorizationService } from "@/core/authorization/application/authorization.service";
import { Action } from "@/core/authorization/domain/action";
import { Resource } from "@/core/authorization/domain/resource";
import { resolveAuthorizationIdentity } from "@/core/authorization/authorizationIdentity.resolver";


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
      __: any,
      context: any
    ) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const userId: string = context.user.userId;
      const tenantId = context.user.tenantId;

      if (!tenantId) {
        throw new Error("Active tenant is required");
      }

      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );
      const listings = await repo.findByOwnerId(userId, tenantId);

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
    createListing: async ( _: any,{ input }: any,context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
     const userId: string = context.user.userId;

if (!userId) {
  throw new Error("User ID is required");
}

const globalRole = context.user.role as GlobalRole;

const isAdmin =
  globalRole === GlobalRole.ADMIN ||
  globalRole === GlobalRole.SUPER_ADMIN;

const activeTenantId =
  context.user.tenantId ?? null;

const identity =
  await resolveAuthorizationIdentity({
    userId,
    globalRole,
    activeTenantId,
  });

const tenantId = isAdmin
  ? input.tenantId
  : identity.tenantId;

if (!tenantId) {
  throw new Error(
    isAdmin
      ? "Target tenant is required"
      : "Active tenant is required"
  );
}

const decision =
  new AuthorizationService().authorize({
    identity: {
      ...identity,
      tenantId,
    },
    action: Action.CREATE,
    resource: Resource.LISTING,
    resourceTenantId: tenantId,
  });

if (!decision.allowed) {
  throw new Error(
    decision.reason ??
    "User is not allowed to create a listing"
  );
}

const resolvedOwnerId: string =
  isAdmin
    ? (input.ownerId || userId)
    : userId;

      const { categories, ...rest } = input;

      const enrichedInput = {
        ...rest,
        tenantId,
        categoryIds: categories,
        ownerId: resolvedOwnerId,
      };
const useCase =
        container.resolve<CreateListingUseCase>(
          TOKENS_LISTING.usecase.createListingUseCase
        );

      return await useCase.execute(
        enrichedInput,
       
      );
    },

    updateListing: async (_: any, { input }: any, context: any) => {
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
