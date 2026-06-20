import { WorkflowRuntime } from "./src/ai-platform/domain/orchestration/runtime/workflow.runtime";

console.log("=== Test 1: Normal cancel and refund ===");
const runtime1 = new WorkflowRuntime();
const result1 = await runtime1.run(
  { goal: "Cancel booking and refund" },
  { 
    bookingId: "booking-123", 
    reason: "Change of plans",
    entities: {
      Booking: { id: "booking-123" }
    }
  }
);
console.log("\nResult:", JSON.stringify(result1, null, 2));

console.log("\n\n=== Test 2: Simulate booking already completed (should trigger replan) ===");
const runtime2 = new WorkflowRuntime();
const result2 = await runtime2.run(
  { goal: "Cancel booking and refund" },
  { 
    bookingId: "booking-456", 
    reason: "simulate-completed", // This triggers the "already completed" error
    entities: {
      Booking: { id: "booking-456" }
    }
  }
);
console.log("\nResult:", JSON.stringify(result2, null, 2));

