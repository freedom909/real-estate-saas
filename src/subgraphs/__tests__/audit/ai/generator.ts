import { readFileSync } from "fs";
import { parse, visit } from "graphql";

export interface AuditTestCase {
  name: string;
  query: string;
  variables?: Record<string, any>;
  context?: Record<string, any>;
  expected?: {
    hasData?: boolean;
    hasErrors?: boolean;
    errorSubstring?: string;
  };
}

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

export function generateTests(): AuditTestCase[] {
  const schemaPath = "./src/subgraphs/audit/schema/schema.graphql";
  const schemaSDL = readFileSync(schemaPath, "utf-8");
  const schema = parse(schemaSDL);

  const mutations: string[] = [];
  const queries: string[] = [];

  visit(schema, {
    ObjectTypeDefinition(node) {
      if (node.name.value === "Mutation") {
        node.fields?.forEach((f) => mutations.push(f.name.value));
      }
      if (node.name.value === "Query") {
        node.fields?.forEach((f) => queries.push(f.name.value));
      }
    },
  });

  const tests: AuditTestCase[] = [];

  // ── Mutation: recordAuditLog ──────────────────────────────────
  if (mutations.includes("recordAuditLog")) {
    tests.push({
      name: "recordAuditLog — valid input",
      query: `
        mutation RecordAuditLog($action: String!, $userId: ID!, $resourceId: ID) {
          recordAuditLog(action: $action, userId: $userId, resourceId: $resourceId) {
            id
            action
            userId
            resourceId
            timestamp
          }
        }
      `,
      variables: {
        action: "LOGIN",
        userId: VALID_OBJECT_ID,
        resourceId: VALID_OBJECT_ID,
      },
      expected: { hasData: true },
    });

    tests.push({
      name: "recordAuditLog — missing userId",
      query: `
        mutation RecordAuditLog($action: String!, $resourceId: ID) {
          recordAuditLog(action: $action, resourceId: $resourceId) {
            id
          }
        }
      `,
      variables: {
        action: "LOGIN",
        resourceId: VALID_OBJECT_ID,
      },
      expected: { hasErrors: true, errorSubstring: "userId" },
    });

    tests.push({
      name: "recordAuditLog — invalid userId format",
      query: `
        mutation RecordAuditLog($action: String!, $userId: ID!, $resourceId: ID) {
          recordAuditLog(action: $action, userId: $userId, resourceId: $resourceId) {
            id
          }
        }
      `,
      variables: {
        action: "LOGIN",
        userId: "not-a-valid-objectid",
        resourceId: VALID_OBJECT_ID,
      },
      expected: { hasErrors: true, errorSubstring: "userId" },
    });

    tests.push({
      name: "recordAuditLog — missing resourceId",
      query: `
        mutation RecordAuditLog($action: String!, $userId: ID!) {
          recordAuditLog(action: $action, userId: $userId) {
            id
          }
        }
      `,
      variables: {
        action: "LOGIN",
        userId: VALID_OBJECT_ID,
      },
      expected: { hasErrors: true, errorSubstring: "resourceId" },
    });

    tests.push({
      name: "recordAuditLog — invalid resourceId format",
      query: `
        mutation RecordAuditLog($action: String!, $userId: ID!, $resourceId: ID) {
          recordAuditLog(action: $action, userId: $userId, resourceId: $resourceId) {
            id
          }
        }
      `,
      variables: {
        action: "LOGIN",
        userId: VALID_OBJECT_ID,
        resourceId: "bad-id",
      },
      expected: { hasErrors: true, errorSubstring: "resourceId" },
    });

    tests.push({
      name: "recordAuditLog — with metadata",
      query: `
        mutation {
          recordAuditLog(
            action: "UPDATE_PROFILE",
            userId: "${VALID_OBJECT_ID}",
            resourceId: "${VALID_OBJECT_ID}",
            metadata: "field=email,old=a@b.com"
          ) {
            id
            action
          }
        }
      `,
      expected: { hasData: true },
    });
  }

  // ── Query: getAuditLog ────────────────────────────────────────
  if (queries.includes("getAuditLog")) {
    tests.push({
      name: "getAuditLog — non-existent id returns null",
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
      variables: { id: VALID_OBJECT_ID },
      expected: { hasData: true },
    });
  }

  // ── Query: getAuditLogsByResource ─────────────────────────────
  if (queries.includes("getAuditLogsByResource")) {
    tests.push({
      name: "getAuditLogsByResource — returns array",
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
      variables: { resourceId: VALID_OBJECT_ID },
      expected: { hasData: true },
    });
  }

  return tests;
}
