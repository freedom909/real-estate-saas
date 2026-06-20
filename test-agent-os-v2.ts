import { AgentOSv2 } from "./src/ai-platform/domain/orchestration/runtime/agent-os-v2";

const test = async () => {
  console.log("🚀 Testing AgentOS v2 - Cognitive Architecture with Knowledge Learning");
  console.log("=".repeat(80));

  const agent = new AgentOSv2();

  console.log("\n📝 Test 1: First attempt (with simulated service failures to learn from)");
  console.log("-".repeat(80));
  const result1 = await agent.run(
    {
      naturalLanguage: "Cancel the booking and process a refund",
    },
    {
      booking: {
        id: "booking-123",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result 1:", JSON.stringify(result1, null, 2));

  console.log("\n\n".repeat(2));
  console.log("📝 Test 2: Second attempt (Agent now has knowledge from previous attempt!)");
  console.log("-".repeat(80));
  const result2 = await agent.run(
    {
      naturalLanguage: "Process a refund for this booking",
    },
    {
      booking: {
        id: "booking-456",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result 2:", JSON.stringify(result2, null, 2));

  console.log("\n\n".repeat(2));
  console.log("📚 Final Knowledge Summary:", JSON.stringify(agent.knowledgeBase.getKnowledgeSummary(), null, 2));

  console.log("\n\n".repeat(2));
  console.log("✅ All AgentOS v2 tests completed!");
  console.log("\n📊 What the Agent learned:");
  console.log("  1. Service reliability patterns");
  console.log("  2. Success/failure statistics");
  console.log("  3. Execution patterns");
};

test();
