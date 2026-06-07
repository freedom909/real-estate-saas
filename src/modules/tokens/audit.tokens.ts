import { SystemLogModel } from "../audit/infrastructure/database/models/system-log.model";

// src/modules/tokens/audit.tokens.ts
export const TOKENS_AUDIT = {
    eventBus: Symbol.for("eventBus"),
     auditClient: Symbol.for("AuditClient"),
     graphqlClient: Symbol.for("AuditGraphQLClient"),

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
      auditService: Symbol.for("audit.services.auditService"),
      auditLogger: Symbol.for("audit.services.auditLogger"),
      decisionLogService: Symbol.for("audit.services.decisionLogService"),
      systemLogService: Symbol.for("audit.services.systemLogService"),
    },
} as const;