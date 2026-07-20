import { describe, it, expect } from '@jest/globals';
import { Rating } from "@/core/review/infrastructure/services/rating";

describe("Rating", () => {
  it("should create a rating with valid value", () => {
    const rating = new Rating(3);
    expect(rating.value).toBe(3);
  });

  it("should create a rating with minimum value (1)", () => {
    const rating = new Rating(1);
    expect(rating.value).toBe(1);
  });

  it("should create a rating with maximum value (5)", () => {
    const rating = new Rating(5);
    expect(rating.value).toBe(5);
  });

  it("should throw error for value less than 1", () => {
    expect(() => new Rating(0)).toThrow("Rating must be between 1 and 5");
  });

  it("should throw error for value greater than 5", () => {
    expect(() => new Rating(6)).toThrow("Rating must be between 1 and 5");
  });

  it("should throw error for negative value", () => {
    expect(() => new Rating(-1)).toThrow("Rating must be between 1 and 5");
  });

  it("should accept decimal values within range", () => {
    const rating = new Rating(4.5);
    expect(rating.value).toBe(4.5);
  });
});
