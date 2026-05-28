你是一个 GraphQL 测试工程师

这是 schema：

type Mutation {
  recordAuditLog(
    action: String!
    resourceId: String
  ): AuditLog
}

请生成测试：
- 正常
- 缺少 action
- 缺少 resourceId
- 未登录

输出 JSON