import { describe, expect, it } from "@jest/globals";
import { EpisodeVectorDB, RetrievedEpisode } from "../../../ai-platform/memory/episode-vector-db";
import { computeFinalActionScore } from "../../../ai-platform/learning/action-score";
import { EpisodeRecord } from "../../../ai-platform/memory/episodic/episode-record";

function createEpisode(
  id: string,
  actionName: string,
  reward: number,
  success = true,
): EpisodeRecord {
  return {
    id,
    timestamp: Date.now(),
    goal: { entity: "booking", field: "status", value: "cancelled" },
    startContext: {
      booking: {
        status: "confirmed",
        channel: "airbnb",
        hoursBeforeCheckin: 48,
      },
      payment: {
        method: "credit_card",
        status: "paid",
        amount: 15000,
      },
    },
    action: {
      name: actionName,
      parameters: {},
    },
    outcome: {
      success,
      reward,
      newState: {},
    },
    duration: 0,
    tags: [],
  };
}

describe("experience prior fusion", () => {
  it("builds similarity-weighted priors with confidence", () => {
    const vectorDb = new EpisodeVectorDB();
    const retrieved: RetrievedEpisode[] = [
      {
        episode: createEpisode("ep-1", "send_coupon:value=2000", 0.8),
        similarity: 0.95,
      },
      {
        episode: createEpisode("ep-2", "send_coupon:value=2000", 0.4),
        similarity: 0.3,
      },
      {
        episode: createEpisode("ep-3", "partial_refund:ratio=0.3", 0.5),
        similarity: 0.7,
      },
    ];

    const priors = vectorDb.getExperiencePriors(retrieved);
    const couponPrior = priors.get("send_coupon:value=2000");

    expect(couponPrior).toBeDefined();
    expect(couponPrior?.attempts).toBe(2);
    expect(couponPrior?.successRate).toBe(1);
    expect(couponPrior?.avgReward).toBeCloseTo((0.95 * 0.8 + 0.3 * 0.4) / (0.95 + 0.3), 5);
    expect(couponPrior?.confidence).toBeCloseTo(0.1, 5);
  });

  it("lets experience prior beat a slightly higher bandit q", () => {
    const scoreWithoutPrior = computeFinalActionScore({
      actionKey: "send_coupon:value=1000",
      banditQ: 0.52,
      priorReward: 0.1,
      priorConfidence: 0.1,
      lambda: 0.3,
    });
    const scoreWithPrior = computeFinalActionScore({
      actionKey: "send_coupon:value=2000",
      banditQ: 0.51,
      priorReward: 0.4,
      priorConfidence: 1,
      lambda: 0.3,
    });

    expect(scoreWithPrior.finalScore).toBeGreaterThan(scoreWithoutPrior.finalScore);
  });
});
