
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
        node.fields?.forEach((field) => mutations.push(field.name.value));
      }

      if (node.name.value === "Query") {
        node.fields?.forEach((field) => queries.push(field.name.value));
      }
    },
  });

  const tests: AuditTestCase[] = [];

  // Mutation: recordAuditLog
  if (mutations.includes("recordAuditLog")) {
    tests.push({
      name: "recordAuditLog — valid input",
      query: `
        mutation RecordAuditLog($input: RecordAuditLogInput!) {
          recordAuditLog(input: $input) {
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
      variables: {
        input: {
          action: "LOGIN",
          userId: VALID_OBJECT_ID,
          resourceId: VALID_OBJECT_ID,
          resourceType: "AUTH",
          status: "SUCCESS",
        },
      },
      expected: { hasData: true },
    });

    tests.push({
      name: "recordAuditLog — missing optional userId",
      query: `
        mutation RecordAuditLog($input: RecordAuditLogInput!) {
          recordAuditLog(input: $input) {
            id
            action
            resourceId
            resourceType
            status
          }
        }
      `,
      variables: {
        input: {
          action: "LOGIN",
          resourceId: VALID_OBJECT_ID,
          resourceType: "AUTH",
          status: "SUCCESS",
        },
      },
      expected: { hasData: true },
    });

    tests.push({
      name: "recordAuditLog — missing required action",
      query: `
        mutation {
          recordAuditLog(
            input: {
              resourceId: "${VALID_OBJECT_ID}"
              resourceType: AUTH
              status: SUCCESS
            }
          ) {
            id
          }
        }
      `,
      expected: {
        hasErrors: true,
        errorSubstring: "action",
      },
    });

    tests.push({
      name: "recordAuditLog — missing required resourceId",
      query: `
        mutation {
          recordAuditLog(
            input: {
              action: "LOGIN"
              resourceType: AUTH
              status: SUCCESS
            }
          ) {
            id
          }
        }
      `,
      expected: {
        hasErrors: true,
        errorSubstring: "resourceId",
      },
    });

    tests.push({
      name: "recordAuditLog — missing required resourceType",
      query: `
        mutation {
          recordAuditLog(
            input: {
              action: "LOGIN"
              resourceId: "${VALID_OBJECT_ID}"
              status: SUCCESS
            }
          ) {
            id
          }
        }
      `,
      expected: {
        hasErrors: true,
        errorSubstring: "resourceType",
      },
    });

    tests.push({
      name: "recordAuditLog — missing required status",
      query: `
        mutation {
          recordAuditLog(
            input: {
              action: "LOGIN"
              resourceId: "${VALID_OBJECT_ID}"
              resourceType: AUTH
            }
          ) {
            id
          }
        }
      `,
      expected: {
        hasErrors: true,
        errorSubstring: "status",
      },
    });

    tests.push({
      name: "recordAuditLog — with metadata",
      query: `
        mutation {
          recordAuditLog(
            input: {
              action: "UPDATE_PROFILE"
              userId: "${VALID_OBJECT_ID}"
              resourceId: "${VALID_OBJECT_ID}"
              resourceType: USER
              status: SUCCESS
              meta: {
                provider: "Google"
                reason: "Profile updated"
                deviceId: "test-device"
              }
            }
          ) {
            id
            action
            meta {
              provider
              reason
              deviceId
            }
          }
        }
      `,
      expected: { hasData: true },
    });
  }

  // Query: getAuditLogs
  if (queries.includes("getAuditLogs")) {
    tests.push({
      name: "getAuditLogs — returns empty array for unknown resource",
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
      variables: {
        resourceId: VALID_OBJECT_ID,
      },
      expected: { hasData: true },
    });

    tests.push({
      name: "getAuditLogs — filter by userId",
      query: `
        query GetAuditLogs($userId: ID!) {
          getAuditLogs(filter: { userId: $userId }) {
            id
            action
            userId
            resourceId
            createdAt
          }
        }
      `,
      variables: {
        userId: VALID_OBJECT_ID,
      },
      expected: { hasData: true },
    });
  }

  return tests;
}
