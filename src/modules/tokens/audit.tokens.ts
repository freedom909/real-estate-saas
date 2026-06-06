// src/modules/tokens/audit.tokens.ts
export const TOKENS_AUDIT = {
    eventBus: Symbol.for("eventBus"),
     auditClient: Symbol.for("AuditClient"),
     graphqlClient: Symbol.for("AuditGraphQLClient"),

    models: {
      audit: Symbol.for("audit.models.audit"),
    },

    repos: {
      auditRepo: Symbol.for("audit.repos.auditRepo"),
      decisionLogRepo: Symbol.for("audit.repos.decisionLogRepo"),
      systemLogRepo: Symbol.for("audit.repos.systemLogRepo"),
    },

    services: {
      auditService: Symbol.for("audit.services.auditService"),
    },
} as const;