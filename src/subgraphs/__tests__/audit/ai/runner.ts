import "reflect-metadata"
import { AuditHarness } from "../harness/audit.harness";

function unwrap(body: any) {
  if (body.kind === "single") return body.singleResult;
  if (body.kind === "incremental") return body.initialResult;
  throw new Error("Unknown response");
}

export async function runTests(testsString: string) {
  const harness = new AuditHarness();
  await harness.init();

  const tests = eval(testsString);

  const results = [];

  for (const t of tests) {
    const res = await harness.execute(
      t.query,
      t.variables,
      t.context
    );

    const result = unwrap(res.body);

    results.push({
      name: t.name,
      data: result.data,
      errors: result.errors
    });
  }

  await harness.close();

  return results;
}