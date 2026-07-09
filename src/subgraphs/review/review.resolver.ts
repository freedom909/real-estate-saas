

import { SubmitCustomerReviewUseCase } from "@/core/review/application/usecase/create.reviewUseCase";
import { SubmitOwnerReplyToCustomerReviewUseCase } from "@/core/review/application/usecase/submitOwnerReplyToCustomerReviewUseCase";
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
    submitCustomerReview: async (_: any, { input }: any, context: any) => {
      console.log("input++:", input);
      const useCase = container.resolve<SubmitCustomerReviewUseCase>(TOKENS_REVIEW.usecase.submitCustomerReview);
      return useCase.execute({ ...input, customerId: context.user.id });
    },

    submitOwnerReplyToCustomerReview: async (_: any, { input }: any, context: any) => {
      console.log("input+++:", input);
      const useCase = container.resolve<SubmitOwnerReplyToCustomerReviewUseCase>(TOKENS_REVIEW.usecase.submitOwnerReplyToCustomerReview);
      return useCase.execute({ ...input, ownerId: context.user.id });
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
    author: (review: any) => ({ __typename: "Customer", id: review.customerId }),
    listing: (review: any) => ({ __typename: "Listing", id: review.listingId }),
    host: (review: any) => ({ __typename: "Owner", id: review.hostId }),
  }
};