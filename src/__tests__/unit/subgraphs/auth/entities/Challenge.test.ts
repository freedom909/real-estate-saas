import { describe, it, expect, jest, afterEach, beforeEach } from '@jest/globals';
import Challenge from "@/subgraphs/auth/domain/entities/challenge.entity";

describe("Challenge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should create a challenge with required fields", () => {
    const expiresAt = new Date("2024-01-15T12:05:00Z");
    const challenge = new Challenge(
      "ch-1",
      "user-1",
      "dev-1",
      "OTP",
      expiresAt,
      "PENDING"
    );

    expect(challenge.id).toBe("ch-1");
    expect(challenge.userId).toBe("user-1");
    expect(challenge.deviceId).toBe("dev-1");
    expect(challenge.type).toBe("OTP");
    expect(challenge.expiresAt).toEqual(expiresAt);
    expect(challenge.status).toBe("PENDING");
  });

  describe("verify", () => {
    it("should transition from PENDING to VERIFIED", () => {
      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T12:05:00Z"),
        "PENDING"
      );

      challenge.verify();

      expect(challenge.status).toBe("VERIFIED");
    });

    it("should throw when not in PENDING state", () => {
      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T12:05:00Z"),
        "VERIFIED"
      );

      expect(() => challenge.verify()).toThrow("Invalid state");
    });

    it("should throw when EXPIRED", () => {
      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T12:05:00Z"),
        "EXPIRED"
      );

      expect(() => challenge.verify()).toThrow("Invalid state");
    });
  });

  describe("isExpired", () => {
    it("should return true when current time is past expiresAt", () => {
      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T11:59:00Z"),
        "PENDING"
      );

      expect(challenge.isExpired()).toBe(true);
    });

    it("should return false when current time is before expiresAt", () => {
      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T12:05:00Z"),
        "PENDING"
      );

      expect(challenge.isExpired()).toBe(false);
    });

    it("should return false when exactly at expiresAt (uses > not >=)", () => {
      jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));

      const challenge = new Challenge(
        "ch-1",
        "user-1",
        "dev-1",
        "OTP",
        new Date("2024-01-15T12:00:00Z"),
        "PENDING"
      );

      // The implementation uses `>` so equal means NOT expired
      expect(challenge.isExpired()).toBe(false);
    });
  });
});
