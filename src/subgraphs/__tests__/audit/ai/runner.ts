import "reflect-metadata";
import { AuditHarness } from "../harness/audit.harness";
import { AuditTestCase } from "./generator";

export interface TestResult {
  name: string;
  data: any;
  errors: any[];
  graphQLErrors: any[];
}

function unwrap(body: any) {
  if (body.kind === "single") return body.singleResult;
  if (body.kind === "incremental") return body.initialResult;
  throw new Error(`Unknown response body kind: ${body.kind}`);
}

export async function runTests(
  tests: AuditTestCase[],
  harness?: AuditHarness
): Promise<TestResult[]> {
  const ownHarness = harness ?? new AuditHarness();
  const shouldClose = !harness;

  if (!harness) {
    await ownHarness.init();
  }

  const results: TestResult[] = [];

  for (const t of tests) {
    try {
      const res = await ownHarness.execute(
        t.query,
        t.variables ?? {},
        t.context ?? {}
      );

      const body = unwrap(res.body);
      const graphQLErrors = (body.errors ?? []).map((e: any) => ({
        message: e.message,
        locations: e.locations,
        path: e.path,
      }));

      results.push({
        name: t.name,
        data: body.data ?? null,
        errors: [],
        graphQLErrors,
      });
    } catch (err: any) {
      results.push({
        name: t.name,
        data: null,
        errors: [{ message: err.message }],
        graphQLErrors: [],
      });
    }
  }

  if (shouldClose) {
    await ownHarness.close();
  }

  return results;
}
