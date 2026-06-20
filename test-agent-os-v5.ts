
import { AgentOSv5, AgentOSv5Result } from "./src/ai-platform/domain/orchestration/runtime/agent-os-v5";
import { Intent } from "./src/ai-platform/domain/orchestration/planner/goal.parser";

async function testAgentOSv5() {
  console.log("\n" + "=".repeat(100));
  console.log("🧪 TEST - Learning from Experience");
  console.log("=".repeat(100));

  const agent = new AgentOSv5();

  const initialState = {
    booking: {
      id: "BKG-999",
      status: "confirmed",
      customerId: "CUST-123"
    },
    payment: {
      id: "PAY-789",
      method: "credit_card",
      amount: 1500,
      status: "paid"
    },
    listing: {
      id: "LST-456",
      hostId: "HOST-789",
      available: false
    }
  };

  const episodes: AgentOSv5Result[] = [];

  for (let i = 0; i < 5; i++) {
    console.log(`\n\n🎯 Episode ${i + 1}`);
    console.log("-".repeat(80));

    const intent: Intent = {
      type: "goal",
      parameters: {
        entity: "booking",
        field: "status",
        value: "cancelled"
      },
      priority: "high",
      constraints: []
    };

    const result = await agent.run(intent, {
      ...initialState,
      booking: { ...initialState.booking, status: "confirmed" }
    });

    episodes.push(result);

    console.log("\n📋 Episode Result:");
    console.log(`   Success: ${result.success}`);
    console.log(`   Mode: ${result.modeUsed}`);
    if (result.episode) {
      console.log(`   Episode ID: ${result.episode.id}`);
    }
    if (result.reflection) {
      console.log(`   Reflection: ${result.reflection.summary}`);
    }
    if (result.newRule) {
      console.log(`   🆕 New Rule: ${result.newRule.name}`);
    }
  }

  console.log("\n\n" + "=".repeat(100));
  console.log("📊 FINAL SYSTEM STATUS - After Learning");
  console.log("=".repeat(100));
  agent.printSystemStatus();

  console.log("\n\n🎉 Demo Complete!");
  console.log("\nKey Points:");
  console.log("- Agent records complete Episodes (Goal-State-Action-Outcome)");
  console.log("- Agent reflects on each experience to extract Lessons");
  console.log("- Agent learns Production Rules from Lessons");
  console.log("- Meta-Cognitive Controller decides which strategy to use");
  console.log("\nThis is a true Learning Cognitive Agent!");
}

testAgentOSv5().catch(console.error);
