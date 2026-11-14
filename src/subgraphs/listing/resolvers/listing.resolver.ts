//src/subgraphs/listing/resolvers/listing.resolver.ts

import { container } from "tsyringe";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";
import { CategoryRepository } from "@/shared/category/infrastructure/category.repository";


import GetListingByIdUseCase from "@/core/listing/application/usecase/getListingById.usecase";
import CreateListingUseCase from "@/core/listing/application/usecase/createListing.usecase";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";


import { MinioStorage } from "@/core/listing/infrastructure/storage/minio.storage";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";

import UpdateListingUseCase from "@/core/listing/application/usecase/updateListing.usecase";

import { GlobalRole } from "@/core/shared/domain/role";
import { AuthorizationService } from "@/core/authorization/application/authorization.service";
import { Action } from "@/core/authorization/domain/action";
import { Resource } from "@/core/authorization/domain/resource";
import { resolveAuthorizationIdentity } from "@/core/authorization/authorizationIdentity.resolver";
import GetFeaturedListingsUseCase from "@/core/listing/application/usecase/getFeaturedListings.usecase";
import { ListingStatus } from "@/core/listing/domain/value-objects/listing.status";
import { SuspendListingUseCase } from "@/core/listing/application/usecase/SuspendListing.usecase";
import { UnpublishListingUseCase } from "@/core/listing/application/usecase/unpublish.usecase";
import { PublishListingUseCase } from "@/core/listing/application/usecase/publishListing.usecase";

async function getAuthorizedListing(
  context: any,
  listingId: string,
  action: Action,
) {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  const userId: string = context.user.userId;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const repo = container.resolve<IListingRepository>(
    TOKENS_LISTING.repos.listingRepository
  );

  // 必须读取数据库中的真实 Listing
  const existing = await repo.findById(listingId);

  if (!existing) {
    throw new Error(`Listing not found: ${listingId}`);
  }

  const identity = await resolveAuthorizationIdentity({
    userId,
    globalRole: context.user.role as GlobalRole,
    activeTenantId: context.user.tenantId ?? null,
  });

  const decision = new AuthorizationService().authorize({
    identity,
    action,
    resource: Resource.LISTING,
    resourceTenantId: existing.tenantId,
    resourceOwnerId: existing.ownerId,
  });

  if (!decision.allowed) {
    throw new Error(
      decision.reason ?? "You are not authorized to perform this action"
    );
  }

  return existing;
}

export const resolvers = {
  Query: {
    categories: async () => {
      const repo =
        container.resolve<CategoryRepository>(
          TOKENS_CATEGORY.categoryRepository
        );

      return repo.findAll();
    },


    listings: async () => {
      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      const listings = await repo.findAll();

      return listings.map(listing => ({
        id: listing.id,
        status: listing.status,
        isBookable: listing.isBookable,
        ownerId: listing.ownerId,
        tenantId: listing.tenantId,
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

    featuredListings: async (
      _: unknown,
      { limit }: { limit?: number }
    ) => {
      const useCase =
        container.resolve<GetFeaturedListingsUseCase>(
          TOKENS_LISTING.usecase.getFeaturedListingsUseCase
        );

      return useCase.execute(limit ?? 6);
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
        status: listing.status,
        isBookable: listing.isBookable,
        ownerId: listing.ownerId,
        tenantId: listing.tenantId,
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
    createListing: async (_: any, { input }: any, context: any) => {
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

    // =========================
    // Publish Listing
    // OWNER only
    // =========================
    publishListing: async (
      _: any,
      { id }: { id: string },
      context: any
    ) => {
      await getAuthorizedListing(
        context,
        id,
        Action.PUBLISH
      );

      const useCase =
        container.resolve<PublishListingUseCase>(
          TOKENS_LISTING.usecase.publishListingUseCase
        );

      return useCase.execute(id);
    },

    // =========================
    // Unpublish Listing
    // OWNER only
    // =========================
    unpublishListing: async (
      _: any,
      { id }: { id: string },
      context: any
    ) => {
      await getAuthorizedListing(
        context,
        id,
        Action.UNPUBLISH
      );

      const useCase =
        container.resolve<UnpublishListingUseCase>(
          TOKENS_LISTING.usecase.unpublishListingUseCase
        );

      return useCase.execute(id);
    },

    // =========================
    // Suspend Listing
    // ADMIN / SUPER_ADMIN only
    // =========================
    suspendListing: async (
      _: any,
      { id }: { id: string },
      context: any
    ) => {
      await getAuthorizedListing(
        context,
        id,
        Action.SUSPEND
      );

      const useCase =
        container.resolve<SuspendListingUseCase>(
          TOKENS_LISTING.usecase.suspendListingUseCase
        );

      return useCase.execute(id);
    },

    updateListing: async (_: any, { input }: any, context: any) => {
      // 1. Authentication
      if (!context.user) {
        throw new Error("User not authenticated");
      }

      const userId: string = context.user.userId;

      if (!userId) {
        throw new Error("User ID is required");
      }

      // 2. Load the real Listing from database
      const repo =
        container.resolve<IListingRepository>(
          TOKENS_LISTING.repos.listingRepository
        );

      const existing = await repo.findById(input.id);

      if (!existing) {
        throw new Error(`Listing not found: ${input.id}`);
      }

      // 3. Resolve identity using the user's active tenant
      const globalRole = context.user.role as GlobalRole;

      const activeTenantId =
        context.user.tenantId ?? null;

      const identity =
        await resolveAuthorizationIdentity({
          userId,
          globalRole,
          activeTenantId,
        });

      // 4. Check authorization against the real Listing tenant and owner
      const decision =
        new AuthorizationService().authorize({
          identity,
          action: Action.UPDATE,
          resource: Resource.LISTING,
          resourceTenantId: existing.tenantId,
          resourceOwnerId: existing.ownerId,
        });

      if (!decision.allowed) {
        throw new Error(
          decision.reason ??
          "User is not allowed to update this listing"
        );
      }

      // 5. Prepare update input
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

      // 6. Execute only after authorization
      const useCase =
        container.resolve<UpdateListingUseCase>(
          TOKENS_LISTING.usecase.updateListingUseCase
        );

      return await useCase.execute(
        id,
        updateInput
      );
    }
  },

  Listing: {
    isBookable: (parent: any): boolean => {
      console.log("[LISTING IS_BOOKABLE DEBUG]", {
        id: parent.id,
        status: parent.status,
        isBookable: parent.isBookable,
        hasStatus: parent.status !== undefined,
        hasIsBookable: parent.isBookable !== undefined,
      });

      return parent.isBookable === true;
    },

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
        console.warn("⚠️ Missing listing:", ref.id);
        return null;
      }
    },

    // owner 和 categories 保持原样

    owner: (parent: any) => ({
      __typename: "User",
      id: parent.ownerId,
    }),
    categories: async (parent: any) => {
      const ids: string[] = parent.categoryIds ?? [];
      if (ids.length === 0) return [];

      const repo =
        container.resolve<CategoryRepository>(
          TOKENS_CATEGORY.categoryRepository
        );
      const rows = await repo.findByIds(ids);

      return rows.map((row: any) => ({
        __typename: "Category",
        id: row.id,
        name: row.name,
      }));
    },
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
