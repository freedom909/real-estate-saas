import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SubmitCustomerReviewUseCase } from "@/core/review/application/usecase/create.reviewUseCase";
import { Review, ReviewStatus } from "@/core/review/infrastructure/services/review";

type MockReviewRepo = {
  save: jest.Mock<any>;
  findById: jest.Mock<any>;
};

describe("SubmitCustomerReviewUseCase", () => {
  let useCase: SubmitCustomerReviewUseCase;
  let mockRepo: MockReviewRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new SubmitCustomerReviewUseCase(mockRepo as any);
  });

  it("should create and save a review", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 4,
      content: "Great place!",
    };

    const savedReview = { id: "review-1", ...input, status: ReviewStatus.PENDING };
    mockRepo.save.mockResolvedValue(savedReview);

    const result = await useCase.execute(input);

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Review));
    expect(result).toEqual(savedReview);
  });

  it("should create review with PENDING status", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 5,
      content: "Excellent!",
    };

    mockRepo.save.mockImplementation(async (review: Review) => {
      expect(review.props.status).toBe(ReviewStatus.PENDING);
      return { id: "review-1", ...input };
    });

    await useCase.execute(input);

    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("should create review with correct rating", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 3,
      content: "Average stay",
    };

    mockRepo.save.mockImplementation(async (review: Review) => {
      expect(review.props.rating.value).toBe(3);
      return { id: "review-1" };
    });

    await useCase.execute(input);
  });

  it("should propagate repository errors", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 4,
      content: "Nice!",
    };

    const error = new Error("Database error");
    mockRepo.save.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow("Database error");
  });

  it("should throw when content is empty", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 4,
      content: "",
    };

    await expect(useCase.execute(input)).rejects.toThrow("Review content cannot be empty");
  });

  it("should throw when rating is out of range", async () => {
    const input = {
      bookingId: "booking-1",
      listingId: "listing-1",
      customerId: "customer-1",
      ownerId: "owner-1",
      rating: 6,
      content: "Too high rating",
    };

    await expect(useCase.execute(input)).rejects.toThrow("Rating must be between 1 and 5");
  });
});
