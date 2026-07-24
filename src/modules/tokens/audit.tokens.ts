// src/modules/tokens/audit.tokens.ts
export const TOKENS_AUDIT = {
     auditClient: Symbol.for("AuditClient"),
     graphqlClient: Symbol.for("AuditGraphQLClient"),
     eventBus: Symbol.for("eventBus"),

    models: {
      audit: Symbol.for("audit.models.audit"),
      decisionLog: Symbol.for("audit.models.decisionLog"),
      systemLogModel: Symbol.for("audit.models.systemLogModel"),
    },

    repos: {
      auditRepo: Symbol.for("audit.repos.auditRepo"),
      decisionLogRepo: Symbol.for("audit.repos.decisionLogRepo"),
      systemLogRepo: Symbol.for("audit.repos.systemLogRepo"),
    },

    services: {
      auditLogger: Symbol.for("audit.services.auditLogger"),
      decisionLogService: Symbol.for("audit.services.decisionLogService"),
      systemLogService: Symbol.for("audit.services.systemLogService"),
    },
} as const;