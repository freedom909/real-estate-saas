你是一个 GraphQL 测试工程师

这是 schema：

```graphql
type AuditLog @key(fields: "id") {
  id: ID!
  action: String!
  userId: ID!
  resourceId: ID!
  metadata: String
  timestamp: String!
}

type Mutation {
  recordAuditLog(
    action: String!
    userId: ID!
    resourceId: ID
    metadata: String
  ): AuditLog!
}

type Query {
  getAuditLog(userId: ID!): AuditLog
  getAuditLogsByResource(resourceId: ID!): [AuditLog!]!
}
```

请生成测试：
- 正常记录审计日志
- 缺少 action
- 缺少 userId
- userId 格式无效
- 缺少 resourceId
- resourceId 格式无效
- 带 metadata 记录
- 查询单条审计日志
- 按资源查询审计日志列表

输出 JSON
