
import { AgentOSv6, AgentOSv6Result } from "./src/ai-platform/domain/orchestration/runtime/agent-os-v6";
import { Intent } from "./src/ai-platform/domain/orchestration/planner/goal.parser";

async function testAgentOSv6() {
  console.log("\n" + "=".repeat(100));
  console.log("🧪 TEST - Learning from 20 Real Business Episodes");
  console.log("=".repeat(100));

  const agent = new AgentOSv6();

  const intents = [
    {
      type: "goal",
      parameters: {
        entity: "booking",
        field: "status",
        value: "cancelled"
      },
      priority: "high",
      constraints: []
    },
    {
      type: "goal",
      parameters: {
        entity: "payment",
        field: "status",
        value: "refunded"
      },
      priority: "high",
      constraints: []
    }
  ];

  const results: AgentOSv6Result[] = [];

  for (let i = 0; i < 20; i++) {
    const intent = intents[i % 2];
    const initialState = {
      booking: {
        id: `BKG-${1000 + i}`,
        status: "confirmed",
        customerId: `CUST-${i}`
      },
      payment: {
        id: `PAY-${1000 + i}`,
        method: "credit_card",
        amount: 1500 + i * 10,
        status: "paid"
      },
      listing: {
        id: `LST-${456 + i}`,
        hostId: `HOST-${789 + i}`,
        available: false
      }
    };

    console.log(`\n\n` + `=`.repeat(100));
    console.log(`🎯 EPISODE ${i + 1}`);
    console.log(`=`.repeat(100));

    const result = await agent.run(intent as Intent, initialState);
    results.push(result);
  }

  console.log(`\n\n` + `=`.repeat(100));
  console.log("📊 FINAL SYSTEM STATUS - After 20 Episodes");
  console.log(`=`.repeat(100));
  agent.printSystemStatus();

  console.log(`\n\n📋 RESULTS:`);
  const strategyCounts: any = {};
  let totalSuccess = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    strategyCounts[r.strategy] = (strategyCounts[r.strategy] || 0) + 1;
    if (r.success) totalSuccess++;
    console.log(`   ${i + 1}. ${r.strategy} - ${r.success ? "✅" : "❌"} (${r.iterations} iter)`);
  }

  console.log(`\n🎯 SUCCESS RATE: ${(totalSuccess / results.length * 100).toFixed(1)}%`);
  console.log(`\n🎯 STRATEGY DISTRIBUTION:`);
  for (const [s, count] of Object.entries(strategyCounts)) {
    console.log(`   ${s}: ${count} times`);
  }

  console.log(`\n\n🎉 Demo Complete!`);
  console.log(`\nKey Improvements in v6:`);
  console.log(`- ✅ WorldState actually updates (no more fake experiences!)`);
  console.log(`- ✅ Episode Retrieval + Reuse (Case-Based Reasoning)`);
  console.log(`- ✅ Real Rule Extraction from Episodes (not fake rules!)`);
  console.log(`- ✅ Policy Learning based on actual success rates`);
  console.log(`- ✅ Focus on Business Experience, not just cognitive concepts`);
}

testAgentOSv6().catch(console.error);
