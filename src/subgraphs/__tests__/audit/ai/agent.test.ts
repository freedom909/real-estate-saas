// ─── Shared infrastructure ──────────────────────────────────────
import "reflect-metadata";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AuditHarness } from "../harness/audit.harness";
import { generateTests } from "./generator";
import { runTests } from "./runner";

let mongoServer: MongoMemoryServer;
let harness: AuditHarness;

function getAllErrors(result: any): any[] {
  return [
    ...(result.errors ?? []),
    ...(result.graphQLErrors ?? []),
  ];
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  harness = new AuditHarness();
  await harness.init();
}, 30_000);

afterAll(async () => {
  await harness?.close();
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe("Audit Subgraph — Integration Tests", () => {
  const tests = generateTests();

  it(`generated ${tests.length} test cases from schema`, () => {
    expect(tests.length).toBeGreaterThan(0);
  });

  describe("Mutation: recordAuditLog", () => {
    const mutationTests = tests.filter((t) =>
      t.name.startsWith("recordAuditLog")
    );

    it.each(mutationTests.map((t) => [t.name, t]))(
      "%s",
      async (_name, t) => {
        const results = await runTests([t as any], harness);

const result = results[0];
const allErrors = getAllErrors(result);

if (t.expected?.hasErrors) {
  expect(allErrors.length).toBeGreaterThan(0);

  if (t.expected.errorSubstring) {
    expect(
      allErrors.some((error: any) =>
        error.message.includes(t.expected!.errorSubstring!)
      )
    ).toBe(true);
  }
} else {
  expect(allErrors).toHaveLength(0);
  expect(result.data).not.toBeNull();
}
      },
      10_000
    );
  });

  describe("Query: getAuditLogs", () => {
    it("returns an empty array for a non-existent resource", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();

      const results = await runTests(
        [
          {
            name: "getAuditLogs",
            query: `
              query GetAuditLogs($resourceId: ID!) {
                getAuditLogs(filter: { resourceId: $resourceId }) {
                  id
                  action
                  userId
                  resourceId
                  resourceType
                  status
                  createdAt
                }
              }
            `,
            variables: { resourceId: validId },
          },
        ],
        harness
      );

      expect(results[0].graphQLErrors).toHaveLength(0);
      expect(results[0].errors).toHaveLength(0);
      expect(results[0].data).not.toBeNull();
      expect(results[0].data.getAuditLogs).toEqual([]);
    }, 10_000);
  });

  describe("Full audit flow", () => {
    it("should record and then query back audit logs", async () => {
      const userId = new mongoose.Types.ObjectId().toHexString();
      const resourceId = new mongoose.Types.ObjectId().toHexString();

      // 1. Record a log
      const recordResults = await runTests(
        [
          {
            name: "record",
            query: `
              mutation {
                recordAuditLog(
                  input: {
                    action: "LOGIN"
                    userId: "${userId}"
                    resourceId: "${resourceId}"
                    resourceType: LISTING
                    status: SUCCESS
                  }
                ) {
                  id
                  action
                  userId
                  resourceId
                  resourceType
                  status
                  createdAt
                }
              }
            `,
          },
        ],
        harness
      );

      expect(recordResults[0].graphQLErrors).toHaveLength(0);
      expect(recordResults[0].errors).toHaveLength(0);
      expect(recordResults[0].data).not.toBeNull();

      const loggedId = recordResults[0].data?.recordAuditLog?.id;
      expect(loggedId).toBeDefined();

      // 2. Query back by resource
      const queryResults = await runTests(
        [
          {
            name: "query",
            query: `
              query {
                getAuditLogs(
                  filter: {
                    resourceId: "${resourceId}"
                  }
                ) {
                  id
                  action
                  userId
                  resourceId
                  resourceType
                  status
                  createdAt
                }
              }
            `,
          },
        ],
        harness
      );

      expect(queryResults[0].graphQLErrors).toHaveLength(0);
      expect(queryResults[0].errors).toHaveLength(0);

      const logs = queryResults[0].data?.getAuditLogs;

      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs.some((l: any) => l.id === loggedId)).toBe(true);
    }, 15_000);
  });
});
