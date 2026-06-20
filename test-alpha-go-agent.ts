
import { AlphaGoStyleAgent } from "./src/ai-platform/agent/alpha-go-style-agent";
import { GoalSpec } from "./src/ai-platform/memory/episodic/episode-record";

async function main() {
  console.log(`\n` + "=".repeat(120));
  console.log(`🧪 ALPHA GO STYLE EXPERIENCE-DRIVEN AGENT - FULL DEMO`);
  console.log("=".repeat(120));
  console.log(`\nKey Features:`);
  console.log(`  1. ✅ State Vector Retrieval (cosineSimilarity)`);
  console.log(`  2. ✅ Contextual Bandit (Q-learning)`);
  console.log(`  3. ✅ Environment-Generated Reward`);
  console.log(`  4. ✅ Parameterized Action Space`);
  console.log(`\nThis is now approaching AlphaGo style experience learning!\n`);

  const agent = new AlphaGoStyleAgent({
    bookingId: "BKG-001",
    paymentId: "PAY-001"
  });

  const goals: GoalSpec[] = [
    { entity: "booking", field: "status", value: "cancelled", operator: "eq" },
    { entity: "payment", field: "status", value: "refunded", operator: "eq" }
  ];

  const totalEpisodes = 30;
  const rewards: number[] = [];
  const successes: boolean[] = [];

  for (let i = 1; i <= totalEpisodes; i++) {
    const goal = goals[(i - 1) % goals.length];
    const result = await agent.runEpisode(goal, i);

    rewards.push(result.reward);
    successes.push(result.success);

    if (i < totalEpisodes) {
      agent.reset();
    }

    // 每10轮打印一次汇总
    if (i % 10 === 0) {
      const recentRewards = rewards.slice(-10);
      const avgReward = recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length;
      const recentSuccessRate = successes.slice(-10).filter(s => s).length / 10;

      console.log(`\n` + "=".repeat(120));
      console.log(`📊 SUMMARY - EPISODES ${i - 9} to ${i}`);
      console.log("=".repeat(120));
      console.log(`    Average Reward: ${avgReward.toFixed(3)}`);
      console.log(`    Success Rate: ${(recentSuccessRate * 100).toFixed(0)}%`);
    }

    // 小延迟
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n\n` + "=".repeat(120));
  console.log(`🎉 FULL DEMO COMPLETE - ALPHA GO STYLE AGENT`);
  console.log("=".repeat(120));

  agent.printFinalStats();

  console.log(`\n\n` + "=".repeat(120));
  console.log(`🚀 FULL ARCHITECTURE ACHIEVED!`);
  console.log("=".repeat(120));
  console.log(`\nFull Flow:`);
  console.log(`  1. Observe State`);
  console.log(`  2. Retrieve Similar Experiences (Vector Search)`);
  console.log(`  3. Generate Parameterized Candidate Actions`);
  console.log(`  4. Contextual Bandit Decision (Q-learning)`);
  console.log(`  5. Execute in Realistic Environment`);
  console.log(`  6. Environment Calculates Reward`);
  console.log(`  7. Update Q(s,a) and Learn`);
  console.log(`\nThis is now a REAL experience-driven learning agent!`);
}

main().catch(console.error);
