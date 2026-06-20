import { AgentOS } from "./src/ai-platform/domain/orchestration/runtime/ooda-agent-loop";

const test = async () => {
  console.log("🚀 Testing AgentOS - Cognitive Architecture");
  console.log("=".repeat(80));

  const agent = new AgentOS();

  console.log("\n📝 Test 1: Simple Cancel + Refund (Confirmed Booking)");
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
  console.log("📝 Test 2: Starting from Pending (Needs Confirm → Cancel → Refund)");
  console.log("-".repeat(80));
  const result2 = await agent.run(
    {
      naturalLanguage: "Process a full refund for this booking",
    },
    {
      booking: {
        id: "booking-456",
        status: "pending"
      }
    }
  );
  console.log("\n📊 Result 2:", JSON.stringify(result2, null, 2));

  console.log("\n\n".repeat(2));
  console.log("✅ All AgentOS tests completed!");
};

test();
