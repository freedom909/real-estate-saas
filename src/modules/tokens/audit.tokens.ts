// src/modules/tokens/audit.tokens.ts
export const TOKENS_AUDIT = {
   
     auditClient: Symbol.for("AuditClient"),
     graphqlClient: Symbol.for("AuditGraphQLClient"),

    models: {
      audit: Symbol.for("audit.models.audit"),
    },

    repos: {
      auditRepo: Symbol.for("audit.repos.auditRepo"),
    },

    services: {
      auditService: Symbol.for("audit.services.auditService"),
    },
} as const;