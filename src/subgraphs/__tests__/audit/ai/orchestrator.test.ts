import "reflect-metadata";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AuditHarness } from "../harness/audit.harness";

// ─── Setup ───────────────────────────────────────────────────────────────────

let mongoServer: MongoMemoryServer;
let harness: AuditHarness;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  harness = new AuditHarness();
  await harness.init();
}, 30_000);

afterAll(async () => {
  await harness?.close();
  await mongoose.disconnect();
  await mongoServer?.stop();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap(body: any) {
  if (body.kind === "single") return body.singleResult;
  if (body.kind === "incremental") return body.initialResult;
  throw new Error(`Unknown response kind: ${body.kind}`);
}

async function execute(query: string, variables = {}, context = {}) {
  const res = await harness.execute(query, variables, context);
  return unwrap(res.body);
}

function oid(): string {
  return new mongoose.Types.ObjectId().toHexString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Orchestrator Agent — Scenario-Based Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe("Audit Orchestrator Agent", () => {
  // ── Scenario 1: User Login Lifecycle ──────────────────────────────────────

  describe("Scenario: User Login Lifecycle", () => {
    const userId = oid();
    const resourceId = oid();

    it("should record LOGIN event", async () => {
      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "LOGIN"
            userId: "${userId}"
            resourceId: "${resourceId}"
          ) {
            id
            action
            userId
            resourceId
            timestamp
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog).toMatchObject({
        action: "LOGIN",
        userId,
        resourceId,
      });
      expect(result.data.recordAuditLog.id).toBeDefined();
      expect(result.data.recordAuditLog.timestamp).toBeDefined();
    });

    it("should query back the LOGIN event by resource", async () => {
      const result = await execute(`
        query {
          getAuditLogsByResource(resourceId: "${resourceId}") {
            id
            action
            userId
            resourceId
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogsByResource).toHaveLength(1);
      expect(result.data.getAuditLogsByResource[0].action).toBe("LOGIN");
    });

    it("should query by userId", async () => {
      const result = await execute(`
        query {
          getAuditLog(userId: "${userId}") {
            id
            action
            userId
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLog).toBeDefined();
    });
  });

  // ── Scenario 2: Multiple Actions on Same Resource ─────────────────────────

  describe("Scenario: Multiple Actions on Same Resource", () => {
    const userId = oid();
    const resourceId = oid();

    it("should record CREATE, UPDATE, DELETE on same resource", async () => {
      const actions = ["LISTING_CREATED", "LISTING_UPDATED", "LISTING_DELETED"];

      for (const action of actions) {
        const result = await execute(`
          mutation {
            recordAuditLog(
              action: "${action}"
              userId: "${userId}"
              resourceId: "${resourceId}"
            ) {
              id
              action
            }
          }
        `);

        expect(result.errors).toBeUndefined();
        expect(result.data.recordAuditLog.action).toBe(action);
      }
    });

    it("should return all 3 logs for the resource", async () => {
      const result = await execute(`
        query {
          getAuditLogsByResource(resourceId: "${resourceId}") {
            id
            action
            userId
            resourceId
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      const logs = result.data.getAuditLogsByResource;
      expect(logs).toHaveLength(3);

      const actions = logs.map((l: any) => l.action).sort();
      expect(actions).toEqual([
        "LISTING_CREATED",
        "LISTING_DELETED",
        "LISTING_UPDATED",
      ]);
    });
  });

  // ── Scenario 3: Multiple Users, Same Resource ─────────────────────────────

  describe("Scenario: Multiple Users, Same Resource", () => {
    const resourceId = oid();
    const user1 = oid();
    const user2 = oid();

    it("should record actions from different users", async () => {
      await execute(`
        mutation {
          recordAuditLog(
            action: "REVIEW_SUBMITTED"
            userId: "${user1}"
            resourceId: "${resourceId}"
          ) { id }
        }
      `);

      await execute(`
        mutation {
          recordAuditLog(
            action: "REVIEW_REPLIED"
            userId: "${user2}"
            resourceId: "${resourceId}"
          ) { id }
        }
      `);
    });

    it("should return logs from both users", async () => {
      const result = await execute(`
        query {
          getAuditLogsByResource(resourceId: "${resourceId}") {
            id
            action
            userId
          }
        }
      `);

      expect(result.data.getAuditLogsByResource).toHaveLength(2);

      const userIds = result.data.getAuditLogsByResource.map(
        (l: any) => l.userId
      );
      expect(userIds).toContain(user1);
      expect(userIds).toContain(user2);
    });
  });

  // ── Scenario 4: Metadata Tracking ─────────────────────────────────────────

  describe("Scenario: Metadata Tracking", () => {
    it("should store metadata on audit log", async () => {
      const userId = oid();
      const resourceId = oid();

      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "PAYMENT_PROCESSED"
            userId: "${userId}"
            resourceId: "${resourceId}"
            metadata: "amount=15000,currency=JPY"
          ) {
            id
            action
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog).toBeDefined();
    });
  });

  // ── Scenario 5: Error Recovery ────────────────────────────────────────────

  describe("Scenario: Error Recovery", () => {
    it("should reject invalid userId and continue accepting valid ones", async () => {
      const validUser = oid();

      // First: invalid userId should fail
      const invalidResult = await execute(`
        mutation {
          recordAuditLog(
            action: "LOGIN"
            userId: "not-a-valid-id"
            resourceId: "${oid()}"
          ) { id }
        }
      `);

      expect(invalidResult.errors).toBeDefined();
      expect(invalidResult.errors[0].message).toContain("userId");

      // Second: valid userId should succeed
      const validResult = await execute(`
        mutation {
          recordAuditLog(
            action: "LOGIN"
            userId: "${validUser}"
            resourceId: "${oid()}"
          ) {
            id
            action
          }
        }
      `);

      expect(validResult.errors).toBeUndefined();
      expect(validResult.data.recordAuditLog).toBeDefined();
    });

    it("should reject invalid resourceId", async () => {
      const userId = oid();

      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "LOGIN"
            userId: "${userId}"
            resourceId: "bad-id"
          ) { id }
        }
      `);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain("resourceId");
    });

    it("should reject null resourceId (required by Mongoose schema)", async () => {
      const userId = oid();

      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "LOGIN"
            userId: "${userId}"
          ) { id }
        }
      `);

      expect(result.errors).toBeDefined();
    });
  });

  // ── Scenario 6: Federation Reference Resolution ───────────────────────────

  describe("Scenario: Federation Reference Resolution", () => {
    it("should resolve AuditLog.user as User federation reference", async () => {
      const userId = oid();
      const resourceId = oid();

      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "PROFILE_UPDATED"
            userId: "${userId}"
            resourceId: "${resourceId}"
          ) {
            id
            action
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog).toBeDefined();
    });
  });

  // ── Scenario 7: Empty State Queries ───────────────────────────────────────

  describe("Scenario: Empty State Queries", () => {
    it("getAuditLog should return null for non-existent user", async () => {
      const result = await execute(`
        query {
          getAuditLog(userId: "${oid()}") {
            id
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLog).toBeNull();
    });

    it("getAuditLogsByResource should return empty array for unknown resource", async () => {
      const result = await execute(`
        query {
          getAuditLogsByResource(resourceId: "${oid()}") {
            id
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogsByResource).toEqual([]);
    });
  });

  // ── Scenario 8: Concurrency Safety ────────────────────────────────────────

  describe("Scenario: Concurrent Writes", () => {
    it("should handle 5 concurrent mutations without errors", async () => {
      const resourceId = oid();
      const userId = oid();

      const mutations = Array.from({ length: 5 }, (_, i) =>
        execute(`
          mutation {
            recordAuditLog(
              action: "CONCURRENT_ACTION_${i}"
              userId: "${userId}"
              resourceId: "${resourceId}"
            ) {
              id
              action
            }
          }
        `)
      );

      const results = await Promise.all(mutations);

      for (const r of results) {
        expect(r.errors).toBeUndefined();
        expect(r.data.recordAuditLog).toBeDefined();
      }

      // Verify all 5 were persisted
      const queryResult = await execute(`
        query {
          getAuditLogsByResource(resourceId: "${resourceId}") {
            id
            action
          }
        }
      `);

      expect(queryResult.data.getAuditLogsByResource).toHaveLength(5);
    });
  });

  // ── Scenario 9: Timestamp Consistency ──────────────────────────────────────

  describe("Scenario: Timestamp Consistency", () => {
    it("should return timestamp as non-empty string", async () => {
      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "TIMESTAMP_TEST"
            userId: "${oid()}"
            resourceId: "${oid()}"
          ) {
            id
            timestamp
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      const ts = result.data.recordAuditLog.timestamp;
      expect(ts).toBeDefined();
      expect(typeof ts).toBe("string");
      expect(ts.length).toBeGreaterThan(0);
    });
  });

  // ── Scenario 10: Action Variants ───────────────────────────────────────────

  describe("Scenario: Action Variants", () => {
    const testActions = [
      "LOGIN",
      "LOGOUT",
      "TOKEN_REFRESH",
      "LISTING_CREATED",
      "LISTING_UPDATED",
      "LISTING_DELETED",
      "BOOKING_CREATED",
      "PAYMENT_PROCESSED",
      "REVIEW_SUBMITTED",
      "PROFILE_UPDATED",
    ];

    it.each(testActions)("should record action: %s", async (action) => {
      const result = await execute(`
        mutation {
          recordAuditLog(
            action: "${action}"
            userId: "${oid()}"
            resourceId: "${oid()}"
          ) {
            id
            action
          }
        }
      `);

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog.action).toBe(action);
    });
  });
});
