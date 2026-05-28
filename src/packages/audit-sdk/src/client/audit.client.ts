import { GraphQLClient } from "graphql-request";

export default class AuditClient {
  constructor(private url: string) {}

  private get client() {
    return new GraphQLClient(this.url);
  }

  // ✅ 写入 audit
  async recordAudit(input: {
    userId: string;
    action: string;
    resourceId?: string;
    metadata?: any;
  }) {
    const mutation = `
      mutation RecordAuditLog(
        $userId: ID!
        $action: String!
        $resourceId: ID
        $metadata: String
      ) {
        recordAuditLog(
          userId: $userId
          action: $action
          resourceId: $resourceId
          metadata: $metadata
        ) {
          id
          action
        }
      }
    `;

    const variables = {
      userId: input.userId,
      action: input.action,
      resourceId: input.resourceId,
      metadata: JSON.stringify(input.metadata || {}),
    };

    console.log("📡 record audit:", variables);

    const data = await this.client.request(mutation, variables);

    return data.recordAuditLog;
  }

  // ✅ 查询 audit
  async queryAuditLogs(params: {
    userId?: string;
    action?: string;
  }) {
    const query = `
      query GetAuditLogs(
        $userId: String
        $action: String
      ) {
        auditLogs(
          userId: $ID!
          action: $action
        ) {
          id
          userId
          action
          resourceId
          metadata
          timestamp
        }
      }
    `;

    const variables = {
      userId: params.userId,
      action: params.action,
    };

    console.log("📡 query audit:", variables);

    const data = await this.client.request(query, variables);

    return data.auditLogs;
  }
}