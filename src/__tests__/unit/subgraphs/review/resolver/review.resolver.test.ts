import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock("@/modules/tokens/review.tokens", () => ({
  TOKENS_REVIEW: {
    repository: { reviewRepository: Symbol.for("ReviewRepository") },
    usecase: {
      submitCustomerReview: Symbol.for("SubmitCustomerReviewUseCase"),
      submitOwnerReplyToCustomerReview: Symbol.for("SubmitOwnerReplyToCustomerReviewUseCase"),
      updateReview: Symbol.for("UpdateReviewUseCase"),
      deleteReview: Symbol.for("DeleteReviewUseCase"),
    },
  },
}));

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

import { reviewResolvers } from "@/subgraphs/review/review.resolver";
import { container } from "tsyringe";

type MockReviewRepo = {
  findById: jest.Mock<any>;
  findByListingId: jest.Mock<any>;
  save: jest.Mock<any>;
};

type MockUseCase = {
  execute: jest.Mock<any>;
};

describe("Review Resolvers", () => {
  let mockRepo: MockReviewRepo;
  let mockSubmitUseCase: MockUseCase;
  let mockOwnerReplyUseCase: MockUseCase;
  let mockUpdateUseCase: MockUseCase;
  let mockDeleteUseCase: MockUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      findById: jest.fn(),
      findByListingId: jest.fn(),
      save: jest.fn(),
    };
    mockSubmitUseCase = { execute: jest.fn() };
    mockOwnerReplyUseCase = { execute: jest.fn() };
    mockUpdateUseCase = { execute: jest.fn() };
    mockDeleteUseCase = { execute: jest.fn() };

    (container.resolve as jest.Mock).mockImplementation((token: symbol) => {
      if (token === Symbol.for("ReviewRepository")) return mockRepo;
      if (token === Symbol.for("SubmitCustomerReviewUseCase")) return mockSubmitUseCase;
      if (token === Symbol.for("SubmitOwnerReplyToCustomerReviewUseCase")) return mockOwnerReplyUseCase;
      if (token === Symbol.for("UpdateReviewUseCase")) return mockUpdateUseCase;
      if (token === Symbol.for("DeleteReviewUseCase")) return mockDeleteUseCase;
      return null;
    });
  });

  describe("Query.review", () => {
    it("should return a review by ID", async () => {
      const mockReview = { id: "review-1", content: "Great!" };
      mockRepo.findById.mockResolvedValue(mockReview);

      const result = await (reviewResolvers as any).Query.review(null, { id: "review-1" });

      expect(container.resolve).toHaveBeenCalledWith(Symbol.for("ReviewRepository"));
      expect(mockRepo.findById).toHaveBeenCalledWith("review-1");
      expect(result).toEqual(mockReview);
    });

    it("should return null when review not found", async () => {
      mockRepo.findById.mockResolvedValue(null);

      const result = await (reviewResolvers as any).Query.review(null, { id: "missing" });

      expect(result).toBeNull();
    });
  });

  describe("Query.reviewsByListing", () => {
    it("should return reviews for a listing", async () => {
      const mockReviews = [
        { id: "review-1", listingId: "listing-1" },
        { id: "review-2", listingId: "listing-1" },
      ];
      mockRepo.findByListingId.mockResolvedValue(mockReviews);

      const result = await (reviewResolvers as any).Query.reviewsByListing(null, { listingId: "listing-1" });

      expect(mockRepo.findByListingId).toHaveBeenCalledWith("listing-1");
      expect(result).toEqual(mockReviews);
    });

    it("should return empty array when no reviews found", async () => {
      mockRepo.findByListingId.mockResolvedValue([]);

      const result = await (reviewResolvers as any).Query.reviewsByListing(null, { listingId: "empty" });

      expect(result).toEqual([]);
    });
  });

  describe("Mutation.submitCustomerReview", () => {
    it("should submit a customer review with user ID from context", async () => {
      const mockReview = { id: "review-1", content: "Nice!" };
      mockSubmitUseCase.execute.mockResolvedValue(mockReview);

      const input = {
        bookingId: "booking-1",
        listingId: "listing-1",
        ownerId: "owner-1",
        rating: 5,
        content: "Nice!",
      };

      const context = { user: { id: "customer-1", userId: "customer-1" } };

      const result = await (reviewResolvers as any).Mutation.submitCustomerReview(
        null,
        { input },
        context
      );

      expect(mockSubmitUseCase.execute).toHaveBeenCalledWith({
        ...input,
        customerId: "customer-1",
      });
      expect(result).toEqual(mockReview);
    });
  });

  describe("Mutation.submitOwnerReplyToCustomerReview", () => {
    it("should submit owner reply with user ID from context", async () => {
      const mockReply = { id: "reply-1" };
      mockOwnerReplyUseCase.execute.mockResolvedValue(mockReply);

      const input = {
        bookingId: "booking-1",
        customerReviewID: "review-1",
        hostReview: { content: "Thanks!", rating: 5, round: 2 },
        comment: { content: "Appreciate it!" },
      };

      const context = { user: { id: "owner-1", userId: "owner-1" } };

      const result = await (reviewResolvers as any).Mutation.submitOwnerReplyToCustomerReview(
        null,
        { input },
        context
      );

      expect(mockOwnerReplyUseCase.execute).toHaveBeenCalledWith({
        ...input,
        ownerId: "owner-1",
      });
      expect(result).toEqual(mockReply);
    });
  });

  describe("Mutation.updateReview", () => {
    it("should update a review", async () => {
      const mockUpdated = { id: "review-1", content: "Updated!" };
      mockUpdateUseCase.execute.mockResolvedValue(mockUpdated);
      mockRepo.findById.mockResolvedValue({ id: "review-1", customerId: "customer-1" });

      const context = { user: { id: "customer-1", userId: "customer-1" } };

      const result = await (reviewResolvers as any).Mutation.updateReview(
        null,
        { id: "review-1", input: { content: "Updated!" } },
        context
      );

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith("review-1", { content: "Updated!" });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe("Mutation.deleteReview", () => {
    it("should delete a review and return true", async () => {
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      const context = { user: { id: "admin-1", userId: "admin-1", role: "SUPER_ADMIN" } };

      const result = await (reviewResolvers as any).Mutation.deleteReview(
        null,
        { id: "review-1" },
        context
      );

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith("review-1");
      expect(result).toBe(true);
    });
  });

  describe("Review.author", () => {
    it("should return Customer reference with customerId", () => {
      const review = { customerId: "cust-1" };
      const result = (reviewResolvers as any).Review.author(review);

      expect(result).toEqual({ __typename: "Customer", id: "cust-1" });
    });
  });

  describe("Review.listing", () => {
    it("should return Listing reference with listingId", () => {
      const review = { listingId: "listing-1" };
      const result = (reviewResolvers as any).Review.listing(review);

      expect(result).toEqual({ __typename: "Listing", id: "listing-1" });
    });
  });

  describe("Review.owner", () => {
    it("should return Owner reference with ownerId", () => {
      const review = { ownerId: "owner-1" };
      const result = (reviewResolvers as any).Review.owner(review);

      expect(result).toEqual({ __typename: "Owner", id: "owner-1" });
    });
  });
});
