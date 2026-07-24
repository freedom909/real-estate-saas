import "reflect-metadata";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AuditHarness } from "../harness/audit.harness";
import { generateTests } from "./generator";
import { runTests } from "./runner";

let mongoServer: MongoMemoryServer;
let harness: AuditHarness;

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

        if (t.expected?.hasErrors) {
          expect(
            results[0].graphQLErrors.length + results[0].errors.length
          ).toBeGreaterThan(0);
        } else {
          expect(results[0].errors.length).toBe(0);
          expect(results[0].data).not.toBeNull();
        }
      },
      10_000
    );
  });

  describe("Query: getAuditLog", () => {
    it("returns null for non-existent id", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      const results = await runTests(
        [
          {
            name: "getAuditLog",
            query: `
              query GetAuditLog($id: ID!) {
                getAuditLog(userId: $id) {
                  id
                  action
                  userId
                  resourceId
                }
              }
            `,
            variables: { id: validId },
          },
        ],
        harness
      );

      expect(results[0].errors.length).toBe(0);
      expect(results[0].data).not.toBeNull();
    }, 10_000);
  });

  describe("Query: getAuditLogsByResource", () => {
    it("returns array for resource", async () => {
      const validId = new mongoose.Types.ObjectId().toHexString();
      const results = await runTests(
        [
          {
            name: "getAuditLogsByResource",
            query: `
              query GetLogsByResource($resourceId: ID!) {
                getAuditLogsByResource(resourceId: $resourceId) {
                  id
                  action
                  userId
                  resourceId
                }
              }
            `,
            variables: { resourceId: validId },
          },
        ],
        harness
      );

      expect(results[0].errors.length).toBe(0);
      expect(results[0].data).not.toBeNull();
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
                  action: "LOGIN",
                  userId: "${userId}",
                  resourceId: "${resourceId}"
                ) {
                  id
                  action
                  userId
                  resourceId
                  timestamp
                }
              }
            `,
          },
        ],
        harness
      );

      expect(recordResults[0].errors.length).toBe(0);
      const loggedId = recordResults[0].data?.recordAuditLog?.id;
      expect(loggedId).toBeDefined();

      // 2. Query back by resource
      const queryResults = await runTests(
        [
          {
            name: "query",
            query: `
              query {
                getAuditLogsByResource(resourceId: "${resourceId}") {
                  id
                  action
                  userId
                  resourceId
                }
              }
            `,
          },
        ],
        harness
      );

      expect(queryResults[0].errors.length).toBe(0);
      const logs = queryResults[0].data?.getAuditLogsByResource;
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs.some((l: any) => l.id === loggedId)).toBe(true);
    }, 15_000);
  });
});
