
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

async function execute(
  query: string,
  variables: Record<string, any> = {},
  context: Record<string, any> = {},
) {
  const res = await harness.execute(query, variables, context);
  return unwrap(res.body);
}

function oid(): string {
  return new mongoose.Types.ObjectId().toHexString();
}

const RECORD_AUDIT_LOG = `
  mutation RecordAuditLog($input: RecordAuditLogInput!) {
    recordAuditLog(input: $input) {
      id
      action
      userId
      tenantId
      ownerId
      resourceId
      resourceType
      status
      requestId
      correlationId
      createdAt
      meta {
        deviceId
        ip
        userAgent
        provider
        reason
      }
    }
  }
`;

const GET_AUDIT_LOGS = `
  query GetAuditLogs($filter: AuditLogFilterInput) {
    getAuditLogs(filter: $filter) {
      id
      action
      userId
      tenantId
      ownerId
      resourceId
      resourceType
      status
      requestId
      correlationId
      createdAt
      meta {
        deviceId
        ip
        userAgent
        provider
        reason
      }
    }
  }
`;

async function recordAuditLog(input: Record<string, any>) {
  return execute(RECORD_AUDIT_LOG, { input });
}

async function getAuditLogs(filter: Record<string, any>) {
  return execute(GET_AUDIT_LOGS, { filter });
}

function validAuditInput(overrides: Record<string, any> = {}) {
  return {
    action: "TEST_ACTION",
    resourceId: oid(),
    resourceType: "AUTH",
    status: "SUCCESS",
    ...overrides,
  };
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
      const result = await recordAuditLog(
        validAuditInput({
          action: "LOGIN",
          userId,
          resourceId,
          resourceType: "AUTH",
        }),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog).toMatchObject({
        action: "LOGIN",
        userId,
        resourceId,
        resourceType: "AUTH",
        status: "SUCCESS",
      });

      expect(result.data.recordAuditLog.id).toBeDefined();
      expect(result.data.recordAuditLog.createdAt).toBeDefined();
    });

    it("should query back the LOGIN event by resource", async () => {
      const result = await getAuditLogs({ resourceId });

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogs).toHaveLength(1);
      expect(result.data.getAuditLogs[0]).toMatchObject({
        action: "LOGIN",
        userId,
        resourceId,
      });
    });

    it("should query by userId", async () => {
      const result = await getAuditLogs({ userId });

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogs).toHaveLength(1);
      expect(result.data.getAuditLogs[0].userId).toBe(userId);
    });
  });

  // ── Scenario 2: Multiple Actions on Same Resource ─────────────────────────

  describe("Scenario: Multiple Actions on Same Resource", () => {
    const userId = oid();
    const resourceId = oid();

    it("should record CREATE, UPDATE, DELETE on same resource", async () => {
      const actions = [
        "LISTING_CREATED",
        "LISTING_UPDATED",
        "LISTING_DELETED",
      ];

      for (const action of actions) {
        const result = await recordAuditLog(
          validAuditInput({
            action,
            userId,
            resourceId,
            resourceType: "LISTING",
          }),
        );

        expect(result.errors).toBeUndefined();
        expect(result.data.recordAuditLog.action).toBe(action);
      }
    });

    it("should return all 3 logs for the resource", async () => {
      const result = await getAuditLogs({ resourceId });

      expect(result.errors).toBeUndefined();

      const logs = result.data.getAuditLogs;
      expect(logs).toHaveLength(3);

      const actions = logs.map((log: any) => log.action).sort();

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
      const first = await recordAuditLog(
        validAuditInput({
          action: "REVIEW_SUBMITTED",
          userId: user1,
          resourceId,
          resourceType: "REVIEW",
        }),
      );

      const second = await recordAuditLog(
        validAuditInput({
          action: "REVIEW_REPLIED",
          userId: user2,
          resourceId,
          resourceType: "REVIEW",
        }),
      );

      expect(first.errors).toBeUndefined();
      expect(second.errors).toBeUndefined();

      expect(first.data.recordAuditLog.userId).toBe(user1);
      expect(second.data.recordAuditLog.userId).toBe(user2);
    });

    it("should return logs from both users", async () => {
      const result = await getAuditLogs({ resourceId });

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogs).toHaveLength(2);

      const userIds = result.data.getAuditLogs.map(
        (log: any) => log.userId,
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

      const result = await recordAuditLog(
        validAuditInput({
          action: "PAYMENT_PROCESSED",
          userId,
          resourceId,
          resourceType: "PAYMENT",
          meta: {
            provider: "MOCK_PAYMENT",
            reason: "Payment processed successfully",
            ip: "127.0.0.1",
          },
        }),
      );

      expect(result.errors).toBeUndefined();

      expect(result.data.recordAuditLog).toMatchObject({
        action: "PAYMENT_PROCESSED",
        userId,
        resourceId,
        meta: {
          provider: "MOCK_PAYMENT",
          reason: "Payment processed successfully",
          ip: "127.0.0.1",
        },
      });
    });
  });

  // ── Scenario 5: Error Recovery ────────────────────────────────────────────

  describe("Scenario: Error Recovery", () => {
    it("should reject missing required fields and continue accepting valid input", async () => {
      // Missing resourceId: GraphQL input validation should reject this.
      const invalidResult = await recordAuditLog({
        action: "LOGIN",
        userId: oid(),
        resourceType: "AUTH",
        status: "SUCCESS",
      });

      expect(invalidResult.errors).toBeDefined();
      expect(
        invalidResult.errors.some((error: any) =>
          error.message.includes("resourceId"),
        ),
      ).toBe(true);

      // A subsequent valid request should still succeed.
      const validResult = await recordAuditLog(
        validAuditInput({
          action: "LOGIN",
          userId: oid(),
          resourceType: "AUTH",
        }),
      );

      expect(validResult.errors).toBeUndefined();
      expect(validResult.data.recordAuditLog).toBeDefined();
    });

    it("should reject null resourceId at GraphQL validation", async () => {
      const result = await recordAuditLog({
        action: "LOGIN",
        userId: oid(),
        resourceId: null,
        resourceType: "AUTH",
        status: "SUCCESS",
      });

      expect(result.errors).toBeDefined();
      expect(
        result.errors.some((error: any) =>
          error.message.includes("resourceId"),
        ),
      ).toBe(true);
    });
  });

  // ── Scenario 6: User Reference Data ───────────────────────────────────────

  describe("Scenario: User Reference Data", () => {
    it("should preserve userId on AuditLog", async () => {
      const userId = oid();
      const resourceId = oid();

      const result = await recordAuditLog(
        validAuditInput({
          action: "PROFILE_UPDATED",
          userId,
          resourceId,
          resourceType: "USER",
        }),
      );

      expect(result.errors).toBeUndefined();

      expect(result.data.recordAuditLog).toMatchObject({
        action: "PROFILE_UPDATED",
        userId,
        resourceId,
        resourceType: "USER",
      });

      // The current AuditLog schema exposes userId, not a User object field.
      // A User federation reference requires an explicit schema design.
    });
  });

  // ── Scenario 7: Empty State Queries ───────────────────────────────────────

  describe("Scenario: Empty State Queries", () => {
    it("getAuditLogs should return empty array for non-existent user", async () => {
      const result = await getAuditLogs({ userId: oid() });

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogs).toEqual([]);
    });

    it("getAuditLogs should return empty array for unknown resource", async () => {
      const result = await getAuditLogs({ resourceId: oid() });

      expect(result.errors).toBeUndefined();
      expect(result.data.getAuditLogs).toEqual([]);
    });
  });

  // ── Scenario 8: Concurrency Safety ────────────────────────────────────────

  describe("Scenario: Concurrent Writes", () => {
    it("should handle 5 concurrent mutations without errors", async () => {
      const resourceId = oid();
      const userId = oid();

      const mutations = Array.from({ length: 5 }, (_, i) =>
        recordAuditLog(
          validAuditInput({
            action: `CONCURRENT_ACTION_${i}`,
            userId,
            resourceId,
            resourceType: "LISTING",
          }),
        ),
      );

      const results = await Promise.all(mutations);

      for (const result of results) {
        expect(result.errors).toBeUndefined();
        expect(result.data.recordAuditLog).toBeDefined();
      }

      // Verify all 5 logs were persisted.
      const queryResult = await getAuditLogs({ resourceId });

      expect(queryResult.errors).toBeUndefined();
      expect(queryResult.data.getAuditLogs).toHaveLength(5);
    });
  });

  // ── Scenario 9: Timestamp Consistency ─────────────────────────────────────

  describe("Scenario: Timestamp Consistency", () => {
    it("should return createdAt as non-empty string", async () => {
      const result = await recordAuditLog(
        validAuditInput({
          action: "TIMESTAMP_TEST",
          userId: oid(),
          resourceType: "LISTING",
        }),
      );

      expect(result.errors).toBeUndefined();

      const createdAt = result.data.recordAuditLog.createdAt;

      expect(createdAt).toBeDefined();
      expect(typeof createdAt).toBe("string");
      expect(createdAt.length).toBeGreaterThan(0);
    });
  });

  // ── Scenario 10: Action Variants ──────────────────────────────────────────

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
      const result = await recordAuditLog(
        validAuditInput({
          action,
          userId: oid(),
          resourceType: "LISTING",
        }),
      );

      expect(result.errors).toBeUndefined();
      expect(result.data.recordAuditLog.action).toBe(action);
    });
  });
});
