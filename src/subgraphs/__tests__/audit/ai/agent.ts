// ai/agent.ts

import { generateTests } from "./generator";
import { runTests } from "./runner";
import { analyzeResult } from "./analyzer";

export async function runAuditAgent() {
  console.log("🤖 AI Agent started...\n");

  // 1. 生成测试
  const tests = await generateTests();

  console.log("🧪 Generated Tests:\n", tests);

  // 2. 执行测试
  const result = await runTests(tests);

  console.log("\n📊 Raw Result:\n", JSON.stringify(result, null, 2));

  // 3. 分析错误
  const analysis = await analyzeResult(result);

  console.log("\n🧠 AI Analysis:\n", analysis);
}

runAuditAgent();