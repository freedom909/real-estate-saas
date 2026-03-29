// infrastructure/audit.client.ts
export class AuditClient {
  async record(event: any) {
    // 👉 GraphQL 调用 audit-subgraph
    console.log("📡 send to audit-subgraph", event);

    // 示例（伪代码）
    /*
    await gqlClient.mutate({
      mutation: CREATE_AUDIT,
      variables: { input: event }
    })
    */
  }
}