import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SubmitOwnerReplyToCustomerReviewUseCase } from "@/core/review/application/usecase/submitOwnerReplyToCustomerReviewUseCase";

type MockReviewRepo = {
  findById: jest.Mock<any>;
  save: jest.Mock<any>;
};

type MockModerationPolicy = {
  validateAndModerate: jest.Mock<any>;
};

type MockReviewMapper = {
  toDomain: jest.Mock<any>;
  toPersistence: jest.Mock<any>;
};

describe("SubmitOwnerReplyToCustomerReviewUseCase", () => {
  let useCase: SubmitOwnerReplyToCustomerReviewUseCase;
  let mockRepo: MockReviewRepo;
  let mockModerationPolicy: MockModerationPolicy;
  let mockReviewMapper: MockReviewMapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockModerationPolicy = {
      validateAndModerate: jest.fn(),
    };
    mockReviewMapper = {
      toDomain: jest.fn(),
      toPersistence: jest.fn(),
    };

    useCase = new SubmitOwnerReplyToCustomerReviewUseCase(
      mockRepo as any,
      mockModerationPolicy as any,
      mockReviewMapper as any
    );
  });

  it("should delegate to moderation policy", async () => {
    const input = {
      bookingId: "booking-1",
      ownerId: "owner-1",
      customerReviewID: "review-1",
      hostReview: { content: "Thanks!", rating: 5, round: 2 },
      comment: { content: "Appreciate it!" },
    };

    const expectedResult = { success: true, ownerReview: { id: "reply-1" } };
    mockModerationPolicy.validateAndModerate.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(mockModerationPolicy.validateAndModerate).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedResult);
  });

  it("should propagate moderation policy errors", async () => {
    const input = { bookingId: "booking-1" };
    const error = new Error("Moderation failed");
    mockModerationPolicy.validateAndModerate.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow("Moderation failed");
  });

  it("should pass through full input to moderation policy", async () => {
    const input = {
      bookingId: "booking-1",
      ownerId: "owner-1",
      customerReviewID: "review-1",
      hostReview: { content: "Great customer!", rating: 5, round: 2 },
      comment: { content: "Would host again" },
      extraField: "test",
    };

    mockModerationPolicy.validateAndModerate.mockResolvedValue({});

    await useCase.execute(input);

    expect(mockModerationPolicy.validateAndModerate).toHaveBeenCalledWith(input);
  });
});
