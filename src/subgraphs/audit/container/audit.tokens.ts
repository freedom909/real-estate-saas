//src/modules/audit/container/audit.tokens.ts

export const TOKENS_AUDIT={

    auditClient: Symbol.for("audit.auditClient"),

    models: {
      audit: Symbol.for("audit.models.audit"),
    },

    repos: {
      auditRepo: Symbol.for("audit.repos.auditRepo"),
    },

    services: {
      auditService: Symbol.for("audit.services.auditService"),
    },
 
}