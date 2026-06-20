
import { AgentOSv6 } from "./src/ai-platform/domain/orchestration/runtime/agent-os-v6";

async function testSimple() {
  console.log("\n" + "=".repeat(100));
  console.log("🧪 SIMPLE TEST - One Episode");
  console.log("=".repeat(100));

  const agent = new AgentOSv6();

  const intent = {
    type: "goal",
    parameters: {
      entity: "booking",
      field: "status",
      value: "cancelled"
    },
    priority: "high",
    constraints: []
  };

  const initialState = {
    booking: {
      id: "BKG-1000",
      status: "confirmed",
      customerId: "CUST-0"
    },
    payment: {
      id: "PAY-1000",
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

  const result = await (agent as any).run(intent, initialState);

  console.log("\n" + "=".repeat(100));
  console.log("📊 RESULT:");
  console.log("=".repeat(100));
  console.log(`Success: ${result.success}`);
  console.log(`Strategy: ${result.strategy}`);
  console.log(`Iterations: ${result.iterations}`);

  console.log("\n🎉 AgentOS v6 Core Features Working!");
}

testSimple().catch(console.error);
