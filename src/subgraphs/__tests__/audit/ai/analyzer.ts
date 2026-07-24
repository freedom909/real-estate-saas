import { TestResult } from "./runner";
import { AuditTestCase } from "./generator";

export interface AnalysisResult {
  total: number;
  passed: number;
  failed: number;
  failures: Array<{
    testName: string;
    reason: string;
    graphQLErrors: any[];
  }>;
}

export function analyzeResult(
  results: TestResult[],
  tests: AuditTestCase[]
): AnalysisResult {
  const failures: AnalysisResult["failures"] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const t = tests[i];
    const expected = t.expected;

    if (expected?.hasErrors) {
      // Expect GraphQL errors
      if (r.graphQLErrors.length === 0 && r.errors.length === 0) {
        failures.push({
          testName: r.name,
          reason: "Expected GraphQL errors but none were returned",
          graphQLErrors: [],
        });
      } else if (expected.errorSubstring) {
        const allMessages = [
          ...r.graphQLErrors.map((e) => e.message),
          ...r.errors.map((e) => e.message),
        ];
        const matched = allMessages.some((msg) =>
          msg.toLowerCase().includes(expected.errorSubstring!.toLowerCase())
        );
        if (!matched) {
          failures.push({
            testName: r.name,
            reason: `Expected error containing "${expected.errorSubstring}" but got: ${allMessages.join("; ")}`,
            graphQLErrors: r.graphQLErrors,
          });
        }
      }
    } else if (expected?.hasData) {
      // Expect successful data
      if (r.errors.length > 0) {
        failures.push({
          testName: r.name,
          reason: `Unexpected error: ${r.errors[0].message}`,
          graphQLErrors: r.graphQLErrors,
        });
      } else if (!r.data) {
        failures.push({
          testName: r.name,
          reason: "Expected data but received null",
          graphQLErrors: r.graphQLErrors,
        });
      }
    } else {
      // No explicit expectation — just check for unexpected errors
      if (r.errors.length > 0) {
        failures.push({
          testName: r.name,
          reason: `Unexpected error: ${r.errors[0].message}`,
          graphQLErrors: r.graphQLErrors,
        });
      }
    }
  }

  return {
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    failures,
  };
}
