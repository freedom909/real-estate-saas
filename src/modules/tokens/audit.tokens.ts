// src/modules/tokens/audit.tokens.ts

export const TOKENS_AUDIT = {

  models: {
    auditLog:
      Symbol.for(
        "audit.models.auditLog"
      ),

    decisionLog:
      Symbol.for(
        "audit.models.decisionLog"
      ),

    systemLog:
      Symbol.for(
        "audit.models.systemLog"
      ),
  },

  repos: {
    auditLog:
      Symbol.for(
        "audit.repos.auditLog"
      ),

    decisionLog:
      Symbol.for(
        "audit.repos.decisionLog"
      ),

    systemLog:
      Symbol.for(
        "audit.repos.systemLog"
      ),
  },

  services: {
    auditLog:
      Symbol.for(
        "audit.services.auditLog"
      ),

    decisionLog:
      Symbol.for(
        "audit.services.decisionLog"
      ),

    systemLog:
      Symbol.for(
        "audit.services.systemLog"
      ),
  },

  queries: {
    getAuditLogs:
      Symbol.for(
        "audit.queries.getAuditLogs"
      ),
    getAuditLogsByResource:
      Symbol.for(
        "audit.queries.getAuditLogsByResource"
      ),
    getDecisionLogs:
      Symbol.for(
        "audit.queries.getDecisionLogs"
      ),

    getSystemLogs:
      Symbol.for(
        "audit.queries.getSystemLogs"
      ),
  },

} as const;