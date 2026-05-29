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
      securityLog:
      Symbol.for(
        "audit.models.securityLog"
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

      securityLog:
      Symbol.for(
        "audit.repos.securityLog"
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

      securityLog:
      Symbol.for(
        "audit.services.securityLog"
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