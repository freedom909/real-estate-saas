
import { ExperienceDrivenAgent } from "./src/ai-platform/agent/experience-driven-agent";
import { GoalSpec } from "./src/ai-platform/memory/episodic/episode-record";

async function main() {
  console.log(`\n${"=".repeat(120)}`);
  console.log(`🧪 EXPERIENCE DRIVEN AGENT - FULL DEMO`);
  console.log(`=".repeat(120)}`);
  console.log(`\nKey improvements:`);
  console.log(`  - Rule Extraction from Episodes`);
  console.log(`  - Policy Store & Policy Learning`);
  console.log(`  - Open Action Space (Action Registry)`);
  console.log(`  - Continuous State Vector (not buckets)`);
  console.log(`  - Feature Success Rates (proper naming)`);
  console.log(`\nLet's watch the Agent LEARN and IMPROVE!\n`);

  const agent = new ExperienceDrivenAgent({
    bookingId: "BKG-001",
    paymentId: "PAY-001"
  });

  const goals: GoalSpec[] = [
    { entity: "booking", field: "status", value: "cancelled", operator: "eq" },
    { entity: "payment", field: "status", value: "refunded", operator: "eq" }
  ];

  const totalIterations = 20;

  for (let i = 1; i <= totalIterations; i++) {
    const goal = goals[(i - 1) % goals.length];
    await agent.run(goal, i);

    if (i < totalIterations) {
      agent.reset();
    }

    // 小延迟让输出更清晰
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n\n${"=".repeat(120)}`);
  console.log(`🎉 DEMO COMPLETE!`);
  console.log(`=".repeat(120)}`);

  agent.printFinalStats();

  console.log(`\n\n${"=".repeat(120)}`);
  console.log(`🚀 ARCHITECTURE ACHIEVED!`);
  console.log(`=".repeat(120)}`);
  console.log(`\nFull flow:`);
  console.log(`  Goal → Retrieve Episodes → Predict Outcomes → Rule Extraction → Policy Store`);
  console.log(`         → Action Competition → Execute → Observe → Feedback → Policy Learning`);
  console.log(`\nThis is now a real Experience-Driven Agent!`);
  console.log(`It will learn and improve its decisions over time!`);
}

main().catch(console.error);
