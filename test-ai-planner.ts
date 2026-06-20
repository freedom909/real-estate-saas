import { WorkflowRuntime } from "./src/ai-platform/domain/orchestration/runtime/workflow.runtime";

console.log("🚀 AI Planning System - Full Test 🚀\n");

const runtime = new WorkflowRuntime();

const test1 = async () => {
  console.log("📝 Test 1: Cancel booking and process refund");
  const result = await runtime.run(
    {
      naturalLanguage: "取消预订并退款",
      goalStates: [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true }
      ],
    },
    {
      booking: {
        id: "booking-123",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result:", JSON.stringify(result, null, 2));
};

const test2 = async () => {
  console.log("\n\n📝 Test 2: Cancel booking, refund, and leave review");
  const result = await runtime.run(
    {
      naturalLanguage: "取消预订，退款，并留下评价",
      goalStates: [
        { entity: "booking", field: "status", value: "cancelled" },
        { entity: "refund", field: "created", value: true },
        { entity: "review", field: "created", value: true }
      ],
    },
    {
      booking: {
        id: "booking-456",
        status: "confirmed"
      }
    }
  );
  console.log("\n📊 Result:", JSON.stringify(result, null, 2));
};

const main = async () => {
  await test1();
  await test2();
  console.log("\n✅ All tests completed!");
};

main();
