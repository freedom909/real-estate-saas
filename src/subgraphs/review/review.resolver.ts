

import { SubmitGuestReviewUseCase } from "@/core/review/application/usecase/createReviewUseCase";
import { IReviewRepository } from "@/core/review/domain/entities/repos/IReviewRepository";
import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { container } from "tsyringe";


export const reviewResolvers = {
  Query: {
    review: async (_: any, { id }: { id: string }) => {
      const repo = container.resolve<IReviewRepository>(TOKENS_REVIEW.repository.reviewRepository);
      return repo.findById(id);
    },
    reviewsByListing: async (_: any, { listingId }: { listingId: string }) => {
      const repo = container.resolve<IReviewRepository>(TOKENS_REVIEW.repository.reviewRepository);
      return repo.findByListingId(listingId);
    }
  },
  Mutation: {
    submitGuestReview: async (_: any, { input }: any, context: any) => {
      console.log("input++:", input);
      const useCase = container.resolve<SubmitGuestReviewUseCase>(TOKENS_REVIEW.usecase.submitGuestReview);
      return useCase.execute({ ...input, guestId: context.user.id });
    },

    submitHostReplyToGuestReview: async (_: any, { input }: any, context: any) => {
      console.log("input+++:", input);
      const useCase = container.resolve<SubmitGuestReviewUseCase>(TOKENS_REVIEW.usecase.submitHostReplyToGuestReview);
      return useCase.execute({ ...input, hostId: context.user.id });
    },
    updateReview: async (_: any, { id, input }: any) => {
        const useCase = container.resolve(TOKENS_REVIEW.usecase.updateReview) as any;
        return useCase.execute(id, input);
    },
    deleteReview: async (_: any, { id }: any) => {
        const useCase = container.resolve(TOKENS_REVIEW.usecase.deleteReview) as any;
        await useCase.execute(id);
        return true;
    },
  },
  Review: {
    author: (review: any) => ({ __typename: "Guest", id: review.guestId }),
    listing: (review: any) => ({ __typename: "Listing", id: review.listingId }),
    host: (review: any) => ({ __typename: "Host", id: review.hostId }),
  }
};