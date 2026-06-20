import { AgentOSv3 } from "./src/ai-platform/domain/orchestration/runtime/agent-os-v3";

const test = async () => {
  console.log("🚀 Testing AgentOS v3 - FULL COGNITIVE ARCHITECTURE");
  console.log("=".repeat(80));

  const agent = new AgentOSv3();

  console.log("\n📝 Test: Full cancellation and refund (with learning)");
  console.log("-".repeat(80));
  const result = await agent.run(
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

  console.log("\n📊 Execution Result:");
  console.log("Success:", result.success);
  console.log("Iterations:", result.iterations);
  
  console.log("\n💭 Memory Summary:");
  console.log(JSON.stringify(result.memorySummary, null, 2));

  console.log("\n🧠 Knowledge Summary:");
  console.log(JSON.stringify(result.knowledgeSummary, null, 2));

  console.log("\n💡 Belief Summary:");
  console.log(JSON.stringify(result.beliefSummary, null, 2));

  console.log("\n🤔 Meta Cognition Summary:");
  console.log(JSON.stringify(result.metaCognitionSummary, null, 2));

  console.log("\n📚 Learning Pipeline Summary:");
  console.log(JSON.stringify(result.learningSummary, null, 2));

  console.log("\n🎯 Goal Separation:");
  console.log("User Goal (IMMUTABLE):", result.userGoal);
  console.log("Agent Goal (MUTABLE):", result.agentGoal);

  console.log("\n✅ COGNITIVE AGENT OS TEST COMPLETE!");
};

test();
