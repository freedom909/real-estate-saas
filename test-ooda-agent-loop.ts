import { OODAAgentLoop } from "./src/ai-platform/domain/orchestration/runtime/ooda-agent-loop";

const test = async () => {
  console.log("🚀 Testing OODA Agent Loop");
  console.log("=".repeat(80));

  const agent = new OODAAgentLoop();

  console.log("\n📝 Test 1: Simple Cancel + Refund (Confirmed Booking)");
  console.log("-".repeat(80));
  const result1 = await agent.run(
    {
      naturalLanguage: "取消预订并退款",
    },
    {
      booking: {
        id: "booking-123",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result 1:", JSON.stringify(result1, null, 2));

  console.log("\n".repeat(3));
  console.log("📜 Reasoning Trace:", result1.reasoningTrace);

  console.log("\n".repeat(3));
  console.log("📝 Test 2: Cancel + Refund from Pending");
  console.log("-".repeat(80));
  const result2 = await agent.run(
    {
      naturalLanguage: "帮我退款",
    },
    {
      booking: {
        id: "booking-456",
        status: "pending"
      }
    }
  );
  console.log("\n📊 Result 2:", JSON.stringify(result2, null, 2));

  console.log("\n".repeat(3));
  console.log("✅ All tests completed!");
};

test();
