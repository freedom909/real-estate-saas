// src/modules/tokens/audit.tokens.ts

export const TOKENS_AUDIT = {
  auditClient: Symbol.for("AuditClient"),
  graphqlClient: Symbol.for("AuditGraphQLClient"),
  eventBus: Symbol.for("eventBus"),

  models: {
    audit: Symbol.for("audit.models.audit"),
    decisionLog: Symbol.for("audit.models.decisionLog"),
    systemLogModel: Symbol.for("audit.models.systemLogModel"),
    auditLogModel: Symbol.for("audit.models.auditLogModel"),
  },

  repos: {
    auditRepo: Symbol.for("audit.repos.auditRepo"),
    auditLogRepository: Symbol.for("audit.repos.auditLogRepository"),

    decisionLogRepo: Symbol.for("audit.repos.decisionLogRepo"),
    systemLogRepo: Symbol.for("audit.repos.systemLogRepo"),
    LogRepo: Symbol.for("audit.repos.securityLogRepo"),
  },

  services: {
    auditLogger: Symbol.for("audit.services.auditLogger"),
    decisionLogService: Symbol.for("audit.services.decisionLogService"),
    systemLogService: Symbol.for("audit.services.systemLogService"),
    getAuditLogsQuery: Symbol.for("audit.services.getAuditLogsQuery"),
  },
} as const;