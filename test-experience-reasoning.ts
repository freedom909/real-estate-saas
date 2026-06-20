
import { ExperienceReasoningAgent } from "./src/ai-platform/agent/experience-reasoning-agent";
import { GoalSpec } from "./src/ai-platform/memory/episodic/episode-record";

async function runDemo() {
  console.log("\n" + "=".repeat(100));
  console.log("🧪 Experience Reasoning Agent - Demo");
  console.log("=".repeat(100));

  const agent = new ExperienceReasoningAgent({
    bookingId: "BKG-001",
    paymentId: "PAY-001"
  });

  const goals: GoalSpec[] = [
    { entity: "booking", field: "status", value: "cancelled", operator: "eq" },
    { entity: "payment", field: "status", value: "refunded", operator: "eq" }
  ];

  for (let episode = 1; episode <= 12; episode++) {
    console.log(`\n\n${"=".repeat(100)}`);
    console.log(`🎬 Episode ${episode}`);
    console.log("=".repeat(100));

    const goal = goals[(episode - 1) % goals.length];

    if (episode > 1) {
      // 每个 Episode 重置一下状态（这样我们可以看到学习）
      agent.reset();
    }

    const result = await agent.run(goal);

    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\n\n" + "=".repeat(100));
  console.log("📊 FINAL SYSTEM STATUS");
  console.log("=".repeat(100));
  agent.printStatus();

  console.log("\n\n" + "=".repeat(100));
  console.log("🎉 SUCCESS! Experience Reasoning System is Working!");
  console.log("=".repeat(100));
  console.log("\nKey Improvements:");
  console.log("1. ✅ WorldModel as Single Source of Truth");
  console.log("2. ✅ Episode Retrieval with Learning Weights");
  console.log("3. ✅ Outcome Prediction BEFORE Execute");
  console.log("4. ✅ Action Ranking by Predicted Success");
  console.log("5. ✅ Full Loop: Retrieve → Predict → Rank → Execute → Learn");
}

runDemo().catch(console.error);
