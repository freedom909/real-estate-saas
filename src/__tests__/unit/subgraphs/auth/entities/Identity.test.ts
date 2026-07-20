import { describe, it, expect } from '@jest/globals';
import { Identity } from "@/subgraphs/auth/domain/entities/identity.entity";

describe("Identity", () => {
  it("should create an identity with required fields", () => {
    const identity = new Identity(
      "id-1",
      "user-1",
      "google",
      "google-123"
    );

    expect(identity.id).toBe("id-1");
    expect(identity.userId).toBe("user-1");
    expect(identity.provider).toBe("google");
    expect(identity.providerId).toBe("google-123");
  });

  it("should create identity with optional email", () => {
    const identity = new Identity(
      "id-1",
      "user-1",
      "google",
      "google-123",
      "user@example.com"
    );

    expect(identity.email).toBe("user@example.com");
  });

  it("should create identity with null email", () => {
    const identity = new Identity(
      "id-1",
      "user-1",
      "github",
      "gh-123",
      null
    );

    expect(identity.email).toBeNull();
  });

  it("should default createdAt to now", () => {
    const before = new Date();
    const identity = new Identity("id-1", "user-1", "google", "g-1");
    const after = new Date();

    expect(identity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(identity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should accept custom createdAt", () => {
    const customDate = new Date("2023-06-15");
    const identity = new Identity(
      "id-1",
      "user-1",
      "google",
      "g-1",
      undefined,
      customDate
    );

    expect(identity.createdAt).toEqual(customDate);
  });

  describe("isSame", () => {
    it("should return true for matching provider and providerId", () => {
      const identity = new Identity(
        "id-1",
        "user-1",
        "google",
        "google-123"
      );

      expect(identity.isSame("google", "google-123")).toBe(true);
    });

    it("should return false for different provider", () => {
      const identity = new Identity(
        "id-1",
        "user-1",
        "google",
        "google-123"
      );

      expect(identity.isSame("github", "google-123")).toBe(false);
    });

    it("should return false for different providerId", () => {
      const identity = new Identity(
        "id-1",
        "user-1",
        "google",
        "google-123"
      );

      expect(identity.isSame("google", "google-456")).toBe(false);
    });

    it("should return false when both differ", () => {
      const identity = new Identity(
        "id-1",
        "user-1",
        "google",
        "google-123"
      );

      expect(identity.isSame("github", "gh-456")).toBe(false);
    });
  });
});
