import { container } from "tsyringe";

// Existing UseCases


// AI UseCases（用 Apply，不用 Generate// Tokens
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import GetListingUseCase from "@/core/listing/application/usecase/getListingUseCase";
import { IListingRepository } from "@/core/listing/domain/entities/IListingRepository";


export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.usecase.getListingUseCase
      );
      return useCase.execute(id);
    },

    // 保留一个 listing（删除重复 repo 版本）
    listing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.usecase.getListingUseCase
      );
      return useCase.execute(id);
    },

    listingsByOwner: async (_: any, { hostId }: { hostId: string }) => {
      const repo = container.resolve<IListingRepository>(
        TOKENS_LISTING.repos.listingRepository
      );
      return repo.findByOwnerId(hostId);
    },


  },

Mutation: {
  createListing: async (_: any, { input }: any) => {
    const useCase =
      container.resolve<CreateListingUseCase>(
        TOKENS_LISTING.usecase.createListingUseCase
      );

    return useCase.execute(input);
  },

  // --------------------------------
  // Generate TITLE suggestion
  // --------------------------------


  // --------------------------------
  // Generate DESCRIPTION suggestion
  // --------------------------------


  // --------------------------------
  // Apply accepted suggestion
  // --------------------------------
},

  Listing: {
    host: (parent: any) => {
      return {
        __typename: "Owner",
        id: parent.hostId,
      };
    },

    ownerId: (parent: any) => parent.hostId,

    categories: (parent: any) => {
      return parent.categories?.map((id: string) => ({
        __typename: "Category",
        id,
      })) || [];
    },

    amenities: (parent: any) => {
      return parent.amenityIds?.map((id: string) => ({
        __typename: "Amenity",
        id,
      })) || [];
    },

    // ✅ Federation reference resolver
    __resolveReference: async (ref: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.usecase.getListingUseCase
      );
      return useCase.execute(ref.id);
    },
  },

  Owner: {
    listings: async (parent: { id: string }) => {
      const repo = container.resolve<IListingRepository>(
        TOKENS_LISTING.repos.listingRepository
      );
      return repo.findByOwnerId(parent.id);
    },
  },
};
