import { ContextualBandit } from "./src/ai-platform/learning/contextual-bandit";
import { IBandit } from "./src/ai-platform/learning/i-bandit";
import { LinUCBBandit } from "./src/ai-platform/learning/linucb-bandit";
import { TabularBanditAdapter } from "./src/ai-platform/learning/tabular-bandit-adapter";
import { StateEncoderV2 } from "./src/ai-platform/reasoning/state-encoder";

type BanditType = "tabular" | "linucb";

interface BenchmarkResult {
  banditType: BanditType;
  avgReward: number;
  successRate: number;
  uniqueActions: number;
  convergenceEpisode: number;
}

const EPISODE_COUNT = 100;
const SEED = 42;
const HOURS_SEQUENCE = [
  ...Array.from({ length: 21 }, (_, index) => 40 + index),
  120,
];
const ACTIONS = [
  "send_coupon:value=2000",
  "refund",
  "cancel",
];
const encoder = new StateEncoderV2();

async function main() {
  console.log(`\n${"=".repeat(120)}`);
  console.log("BENCHMARK: TABULAR VS LINUCB");
  console.log("=".repeat(120));
  console.log(`Episode Count: ${EPISODE_COUNT}`);
  console.log(`Seed: ${SEED}`);
  console.log(`Hours Sequence: ${HOURS_SEQUENCE.join(", ")}`);

  const tabular = await runBenchmark("tabular");
  const linucb = await runBenchmark("linucb");

  console.log(`\n${"=".repeat(120)}`);
  console.log("RESULTS");
  console.log("=".repeat(120));
  console.table([
    tabular,
    linucb,
  ]);
}

async function runBenchmark(banditType: BanditType): Promise<BenchmarkResult> {
  return withSeed(SEED, async () => {
    const bandit = createBandit(banditType);

    const rewards: number[] = [];
    let successes = 0;
    const actions = new Set<string>();

    for (let episode = 1; episode <= EPISODE_COUNT; episode++) {
      const hours = HOURS_SEQUENCE[(episode - 1) % HOURS_SEQUENCE.length];
      const stateVector = encoder.encode(createState(hours)).values;
      const decision = bandit.selectAction(stateVector, ACTIONS);
      const reward = rewardOracle(hours, decision.action);

      bandit.update(stateVector, decision.action, reward);
      bandit.decayExploration?.();

      rewards.push(reward);
      actions.add(decision.action);
      if (reward >= 0.5) {
        successes++;
      }
    }

    return {
      banditType,
      avgReward: average(rewards),
      successRate: successes / EPISODE_COUNT,
      uniqueActions: actions.size,
      convergenceEpisode: findConvergenceEpisode(rewards),
    };
  });
}

function createBandit(banditType: BanditType): IBandit {
  if (banditType === "linucb") {
    return new LinUCBBandit({
      dimensions: encoder.encode(createState(48)).values.length,
      alpha: 1.0,
    });
  }

  return new TabularBanditAdapter(new ContextualBandit());
}

function findConvergenceEpisode(rewards: number[], window = 10, tolerance = 0.02): number {
  if (rewards.length < window) {
    return rewards.length;
  }

  const finalAverage = average(rewards.slice(-window));

  for (let index = window; index <= rewards.length; index++) {
    const currentAverage = average(rewards.slice(index - window, index));
    if (Math.abs(currentAverage - finalAverage) <= tolerance) {
      return index;
    }
  }

  return rewards.length;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createState(hoursBeforeCheckin: number) {
  return {
    booking: {
      status: "confirmed",
      channel: "airbnb",
      hoursBeforeCheckin,
      amount: 15000,
    },
    payment: {
      method: "credit_card",
      status: "paid",
      amount: 15000,
    },
  };
}

function rewardOracle(hoursBeforeCheckin: number, action: string): number {
  if (action === "send_coupon:value=2000") {
    const distancePenalty = Math.min(0.5, Math.abs(hoursBeforeCheckin - 48) * 0.02);
    return 0.8 - distancePenalty;
  }

  if (action === "refund") {
    return hoursBeforeCheckin <= 50 ? 0.45 : 0.4;
  }

  return hoursBeforeCheckin <= 24 ? 0.42 : 0.38;
}

async function withSeed<T>(seed: number, work: () => Promise<T>): Promise<T> {
  const originalRandom = Math.random;
  const random = createSeededRandom(seed);
  Math.random = () => random();

  try {
    return await work();
  } finally {
    Math.random = originalRandom;
  }
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

main().catch(console.error);
