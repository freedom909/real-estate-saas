import { generateTests } from "../../__tests__/audit/ai/generator";
import { runTests } from "../../__tests__/audit/ai/runner";
import { analyzeResult } from "../../__tests__/audit/ai/analyzer";
import { injectable } from "tsyringe";

@injectable()
export class AuditTestAgent {
  /**
   * Orchestrates the AI-driven audit validation workflow.
   */
  async execute() {
    console.log("🤖 Audit QA Agent started...\n");

    // 1. Generate Tests based on domain schema
    const tests = await generateTests();
    console.log("🧪 Generated Tests:\n", tests);

    // 2. Execute against the Audit harness
    const result = await runTests(tests);

    // 3. AI-driven analysis of failure patterns
    const analysis = await analyzeResult(result);
    return analysis;
  }
}