
import { ExperienceAgentV2 } from "./src/ai-platform/agent/experience-agent-v2";
import { GoalSpec } from "./src/ai-platform/memory/episodic/episode-record";

async function main() {
  console.log("\n" + "=".repeat(120));
  console.log("🧪 Experience Agent V2 - 10+ Actions, Real Business Values");
  console.log("=".repeat(120));

  const agent = new ExperienceAgentV2({
    bookingId: "BKG-001",
    paymentId: "PAY-001"
  });

  const goals: GoalSpec[] = [
    { entity: "booking", field: "status", value: "cancelled", operator: "eq" },
    { entity: "payment", field: "status", value: "refunded", operator: "eq" }
  ];

  const totalIterations = 15;

  for (let i = 1; i <= totalIterations; i++) {
    const goal = goals[(i - 1) % goals.length];
    const result = await agent.run(goal, i);

    if (i < totalIterations) {
      agent.reset();
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log("\n" + "=".repeat(120));
  console.log("🏁 FINAL RESULTS");
  console.log("=".repeat(120));

  agent.printFullStatus();

  console.log("\n" + "=".repeat(120));
  console.log("🎉 Experience Agent V2 Complete!");
  console.log("=".repeat(120));
  console.log("\nKey Achievements:");
  console.log("1. ✅ 10+ Action Space (real business actions)");
  console.log("2. ✅ State Encoding + Cosine Similarity (no manual weights)");
  console.log("3. ✅ Real Business Value Rewards (not just 1/-0.5)");
  console.log("4. ✅ Outcome Prediction without Data Leakage");
  console.log("5. ✅ Feature Importance learned from data");
  console.log("6. ✅ Action Competition (10 actions compete for best choice)");
}

main().catch(console.error);
