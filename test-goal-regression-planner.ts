import { WorkflowRuntime } from "./src/ai-platform/domain/orchestration/runtime/workflow.runtime";

const test = async () => {
  console.log("🚀 Testing Goal Regression Planner (Backward Chaining)");
  console.log("=".repeat(80));

  const runtime = new WorkflowRuntime();

  console.log("\n📝 Test 1: Simple Cancel + Refund (Confirmed Booking)");
  console.log("-".repeat(80));
  const result1 = await runtime.run(
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

  console.log("\n📝 Test 2: Cancel + Refund + Release Calendar + Review");
  console.log("-".repeat(80));
  const result2 = await runtime.run(
    {
      naturalLanguage: "取消预订，退款，释放日历，并留下评价",
    },
    {
      booking: {
        id: "booking-456",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result 2:", JSON.stringify(result2, null, 2));

  console.log("\n".repeat(3));

  console.log("\n📝 Test 3: Regression from Pending → Refund (needs Confirm → Cancel)");
  console.log("-".repeat(80));
  const result3 = await runtime.run(
    {
      naturalLanguage: "退款",
    },
    {
      booking: {
        id: "booking-789",
        status: "pending"
      }
    }
  );
  console.log("\n📊 Result 3:", JSON.stringify(result3, null, 2));

  console.log("\n".repeat(3));
  console.log("✅ All tests completed!");
};

test();
