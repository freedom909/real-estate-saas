import { WorkflowRuntime } from "./src/ai-platform/domain/orchestration/runtime/workflow.runtime";

console.log("🚀 Testing V3 AI Planning Engine\n");

// Test 1: Cancel and Refund
console.log("📝 Test 1: Cancel booking and refund");
const runtime1 = new WorkflowRuntime();
const result1 = await runtime1.run(
  { 
    naturalLanguage: "Cancel the booking and process a refund",
    entities: { bookingId: "booking-123" }
  },
  { 
    state: {
      booking: {
        id: "booking-123",
        status: "confirmed"
      }
    }
  }
);
console.log("\n📊 Result:", JSON.stringify(result1, null, 2));

// Test 2: Cancel, Refund, and Review
console.log("\n\n📝 Test 2: Cancel booking, refund, and leave a review");
const runtime2 = new WorkflowRuntime();
const result2 = await runtime2.run(
  { 
    goal: {
      description: "Cancel booking, refund, and leave a 5-star review",
      targetState: {
        booking: { status: "cancelled" },
        refund: { created: true },
        review: { created: true }
      }
    },
    entities: { bookingId: "booking-456" }
  },
  { 
    state: {
      booking: {
        id: "booking-456",
        status: "confirmed"
      }
    }
  }
);
console.log("\n📊 Result:", JSON.stringify(result2, null, 2));
