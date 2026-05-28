import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import RiskPolicyService from "../../../../../subgraphs/auth/services/risk/risk.policy.service";

describe("RiskPolicyService", () => {
  let service: RiskPolicyService;
  // Fixed "Now": Jan 2, 2024, 12:00 PM
  const NOW_TIME = new Date("2024-01-02T12:00:00.000Z");

  beforeEach(() => {
    service = new RiskPolicyService();
    jest.useFakeTimers();
    jest.setSystemTime(NOW_TIME);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("evaluateRisk", () => {
    it("should return no violation if event list is empty", async () => {
      const result = await service.evaluateRisk([]);

      expect(result).toEqual({
        shouldBlock: false,
        shouldFreeze: false,
        shouldForceReauth: false,
        message: "No policy violations detected",
      });
    });

    it("should return no violation for unrelated event types", async () => {
      const events = [
        { type: "login_failed", timestamp: new Date(NOW_TIME.getTime() - 1000) },
        { type: "password_changed", timestamp: new Date(NOW_TIME.getTime() - 2000) },
      ];

      const result = await service.evaluateRisk(events);

      expect(result.shouldFreeze).toBe(false);
      expect(result.message).toContain("No policy violations");
    });

    it("should FREEZE account if 'refreshToken_REUSE' occurred within the last 24 hours", async () => {
      // 1 hour ago
      const recentEvent = {
        type: "refreshToken_REUSE",
        timestamp: new Date(NOW_TIME.getTime() - 60 * 60 * 1000),
      };

      const result = await service.evaluateRisk([recentEvent]);

      expect(result).toEqual({
        shouldBlock: false,
        shouldFreeze: true,
        shouldForceReauth: false,
        message: "Account frozen due to refresh token reuse",
      });
    });

    it("should NOT freeze account if 'refreshToken_REUSE' is older than 24 hours", async () => {
      // 25 hours ago
      const oldEvent = {
        type: "refreshToken_REUSE",
        timestamp: new Date(NOW_TIME.getTime() - 25 * 60 * 60 * 1000),
      };

      const result = await service.evaluateRisk([oldEvent]);

      expect(result.shouldFreeze).toBe(false);
    });

    it("should freeze if multiple events exist and at least one is a recent reuse", async () => {
      const oldEvent = {
        type: "refreshToken_REUSE",
        timestamp: new Date(NOW_TIME.getTime() - 48 * 60 * 60 * 1000), // 48h ago
      };
      const recentEvent = {
        type: "refreshToken_REUSE",
        timestamp: new Date(NOW_TIME.getTime() - 10 * 60 * 1000), // 10m ago
      };
      const otherEvent = {
        type: "login_success",
        timestamp: NOW_TIME,
      };

      const result = await service.evaluateRisk([oldEvent, otherEvent, recentEvent]);

      expect(result.shouldFreeze).toBe(true);
    });
  });
});