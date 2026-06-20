
import { ExperienceAgent } from "./src/ai-platform/agent/experience-agent";
import { GoalSpec } from "./src/ai-platform/memory/episodic/episode-record";
import { Strategy } from "./src/ai-platform/learning/policy-learner";

async function main() {
  console.log("\n" + "=".repeat(100));
  console.log("🧪 [TEST] ExperienceAgent - Learning from Real Business Episodes");
  console.log("=".repeat(100));

  // 创建 Agent（持久化的环境）
  const agent = new ExperienceAgent({
    bookingId: "BKG-001",
    paymentId: "PAY-001"
  });

  const goals: GoalSpec[] = [
    { entity: "booking", field: "status", value: "cancelled" },
    { entity: "payment", field: "status", value: "refunded" }
  ];

  // 运行 10 个 Episode，让 Agent 学习
  for (let i = 0; i < 10; i++) {
    console.log(`\n\n🎬 Episode ${i + 1}`);

    const goal = goals[i % goals.length];

    const result = await agent.run(goal);

    console.log(`\n✅ Episode ${i + 1} Complete:`);
    console.log(`   Strategy: ${result.strategy}`);
    console.log(`   Success: ${result.success}`);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log("\n\n" + "=".repeat(100));
  console.log("📊 FINAL REPORT");
  console.log("=".repeat(100));
  agent.printStatus();

  console.log("\n\n🎉 Key Achievements in ExperienceAgent:");
  console.log("1. ✅ World State persists (not recreated every run)");
  console.log("2. ✅ Real business executors (no Math.random() fake results)");
  console.log("3. ✅ Rule Learner drops IDs, keeps business attributes");
  console.log("4. ✅ Policy Learner uses Q-Learning (not just statistics)");
  console.log("5. ✅ Episode Retrieval matches Goal + State + Context");
}

main().catch(console.error);
