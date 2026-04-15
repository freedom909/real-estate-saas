import { container } from "tsyringe";

// Existing UseCases
import CreateListingUseCase from "../application/use-cases/CreateListingUseCase";
import GetListingUseCase from "../application/use-cases/GetListingUseCase";

// AI UseCases（用 Apply，不用 Generate）


// Tokens
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import { ApplyTitleSuggestionUseCase } from "../application/use-cases/ApplyTitleSuggestionUseCase";
import { ApplyDescriptionSuggestionUseCase } from "../application/use-cases/ApplyDescriptionSuggestionUseCase";

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
  },

  Mutation: {
    createListing: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateListingUseCase>(
        TOKENS_LISTING.CreateListingUseCase
      );
      return useCase.execute(input);
    },

    // ✅ 正确：调用 Apply（包含 save）
    applyTitleSuggestion: async (_: any, { listingId }: { listingId: string }) => {
      const useCase = container.resolve(ApplyTitleSuggestionUseCase);
      return useCase.execute(listingId);
    },

    applyDescriptionSuggestion: async (_: any, { listingId }: { listingId: string }) => {
      const useCase = container.resolve(ApplyDescriptionSuggestionUseCase);
      return useCase.execute(listingId);
    },
  },

  Listing: {
    tenant: (parent: any) => {
      return {
        __typename: "Tenant",
        id: parent.tenantId,
      };
    },

    // ✅ Federation reference resolver
    __resolveReference: async (ref: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.GetListingUseCase
      );
      return useCase.execute(ref.id);
    },
  },

  Tenant: {
    properties: async (parent: { id: string }) => {
      // ❗ 修复：这里应该返回“列表”，不是单个 listing
      const useCase = container.resolve<GetListingUseCase>(
        TOKENS_LISTING.GetListingUseCase
      );

      // ⚠️ TODO: 你未来应该做一个 GetListingsByTenantUseCase
      return useCase.execute(parent.id);
    },
  },
};