import { container } from "tsyringe";
import { TOKENS_REVIEW } from "../../container/review.tokens";
import { CreateReviewUseCase } from "../../application/usecases/CreateReviewUseCase";

export const reviewResolvers = {
  Query: {
    review: async (_: any, { id }: { id: string }) => {
      const repo = container.resolve(TOKENS_REVIEW.repository.reviewRepository);
      return repo.findById(id);
    },
    reviewsByListing: async (_: any, { listingId }: { listingId: string }) => {
      const repo = container.resolve(TOKENS_REVIEW.repository.reviewRepository);
      return repo.findByListingId(listingId);
    }
  },
  Mutation: {
    createReview: async (_: any, { input }: any, context: any) => {
      const useCase = container.resolve<CreateReviewUseCase>(TOKENS_REVIEW.usecase.createReview);
      return useCase.execute({ ...input, guestId: context.user.id });
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