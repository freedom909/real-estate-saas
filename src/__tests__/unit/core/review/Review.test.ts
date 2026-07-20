import { describe, it, expect } from '@jest/globals';
import { Review, ReviewStatus } from "@/core/review/infrastructure/services/review";
import { Rating } from "@/core/review/infrastructure/services/rating";

describe("Review", () => {
  const validProps = {
    bookingId: "booking-1",
    listingId: "listing-1",
    customerId: "customer-1",
    ownerId: "owner-1",
    rating: new Rating(4),
    content: "Great place!",
    status: ReviewStatus.PENDING,
  };

  it("should create a review with valid props", () => {
    const review = new Review(validProps);

    expect(review.props.bookingId).toBe("booking-1");
    expect(review.props.listingId).toBe("listing-1");
    expect(review.props.customerId).toBe("customer-1");
    expect(review.props.ownerId).toBe("owner-1");
    expect(review.props.rating.value).toBe(4);
    expect(review.props.content).toBe("Great place!");
    expect(review.props.status).toBe(ReviewStatus.PENDING);
  });

  it("should throw error when content is empty", () => {
    expect(() => new Review({ ...validProps, content: "" })).toThrow("Review content cannot be empty");
  });

  it("should throw error when content is whitespace only", () => {
    expect(() => new Review({ ...validProps, content: "   " })).toThrow("Review content cannot be empty");
  });

  it("should accept optional fields", () => {
    const review = new Review({
      ...validProps,
      id: "review-1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
    });

    expect(review.props.id).toBe("review-1");
    expect(review.props.createdAt).toEqual(new Date("2024-01-01"));
    expect(review.props.updatedAt).toEqual(new Date("2024-01-02"));
  });

  it("should accept different review statuses", () => {
    Object.values(ReviewStatus).forEach((status) => {
      const review = new Review({ ...validProps, status });
      expect(review.props.status).toBe(status);
    });
  });
});
