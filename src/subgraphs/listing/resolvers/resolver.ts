import { container } from "tsyringe";

// Existing UseCases
import CreateListingUseCase from "../application/use-cases/createListingUseCase";
import GetListingUseCase from "../application/use-cases/getListingUseCase";

// AI UseCases（用 Apply，不用 Generate// Tokens
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";


import { GenerateTitleSuggestionUseCase } from "../application/use-cases/generateTitleSuggestionUseCase";
import { ApplyAISuggestionUseCase } from "../application/use-cases/applyAISuggestionUseCase";
import { GenerateDescriptionSuggestionUseCase } from "../application/use-cases/generateDescriptionSuggestionUseCase";

export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.GetListingUseCase
      );
      return useCase.execute(id);
    },

    // 保留一个 listing（删除重复 repo 版本）
    listing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.GetListingUseCase
      );
      return useCase.execute(id);
    },

    listingsByHost: async (_: any, { hostId }: { hostId: string }) => {
      const repo = container.resolve(TOKENS_LISTING.ListingRepository) as {
        findByHostId(hostId: string): Promise<unknown[]>;
      };
      return repo.findByHostId(hostId);
    },
  },

Mutation: {
  createListing: async (_: any, { input }: any) => {
    const useCase =
      container.resolve<CreateListingUseCase>(
        TOKENS_LISTING.CreateListingUseCase
      );

    return useCase.execute(input);
  },

  // --------------------------------
  // Generate TITLE suggestion
  // --------------------------------
  generateTitleSuggestion: async (
    _: any,
    { listingId }: { listingId: string }
  ) => {

    const useCase =
      container.resolve(
        GenerateTitleSuggestionUseCase
      );

    return useCase.execute(listingId);
  },

  // --------------------------------
  // Generate DESCRIPTION suggestion
  // --------------------------------
  generateDescriptionSuggestion: async (
    _: any,
    { listingId }: { listingId: string }
  ) => {

    const useCase =
      container.resolve(
        GenerateDescriptionSuggestionUseCase
      );

    return useCase.execute(listingId);
  },

  // --------------------------------
  // Apply accepted suggestion
  // --------------------------------
  applyAISuggestion: async (
    _: any,
    { suggestionId }: { suggestionId: string }
  ) => {

    const useCase =
      container.resolve(
        ApplyAISuggestionUseCase
      );

    return useCase.execute(suggestionId);
  },
},

  Listing: {
    host: (parent: any) => {
      return {
        __typename: "Host",
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
        TOKENS_LISTING.GetListingUseCase
      );
      return useCase.execute(ref.id);
    },
  },

  Host: {
    listings: async (parent: { id: string }) => {
      const repo = container.resolve(TOKENS_LISTING.ListingRepository) as {
        findByHostId(hostId: string): Promise<unknown[]>;
      };
      return repo.findByHostId(parent.id);
    },
  },
};
