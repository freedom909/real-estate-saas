
import { AgentOSv4, AgentOSv4Result } from './src/ai-platform/domain/orchestration/runtime/agent-os-v4';
import { Intent } from './src/ai-platform/domain/orchestration/planner/goal.parser';

async function testAgentOSv4() {
  console.log("\n" + "=".repeat(100));
  console.log("🧠 AGENTOS v4 - 完整认知架构演示 (SOAR + ACT-R + OpenCog)");
  console.log("=".repeat(100));

  // 初始化 AgentOS v4
  const agentOS = new AgentOSv4();

  // 定义用户意图
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

  // 初始状态
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
    },
    refund: {
      totalCalls: 10,
      success: 3,
      reliability: 0.3
    }
  };

  console.log("\n🎯 输入参数:");
  console.log(`Intent: ${JSON.stringify(intent, null, 2)}`);
  console.log(`Initial State: ${JSON.stringify(initialState, null, 2)}`);

  // 运行 AgentOS v4
  const result: AgentOSv4Result = await agentOS.run(intent, initialState);

  // 打印系统状态
  agentOS.printSystemStatus();

  // 总结结果
  console.log("\n" + "=".repeat(100));
  console.log("✅ 结果总结");
  console.log("=".repeat(100));
  console.log(`\nSuccess: ${result.success}`);
  console.log(`Iterations: ${result.iterations}`);
}

// 运行测试
testAgentOSv4().catch(error => {
  console.error("Error testing AgentOS v4:", error);
  process.exit(1);
});
