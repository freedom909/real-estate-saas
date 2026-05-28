import { container } from "tsyringe";
import { TOKENS_AUDIT_WRITER } from "@/modules/tokens/audit.writer.tokens";

// Models
import { AuditLogModel } from "../infrastructure/database/models/audit-log.model";
import { DecisionLogModel } from "../infrastructure/database/models/decision-log.model";
import { SystemLogModel } from "../infrastructure/database/models/system-log.model";

// Repositories
import { AuditLogRepository } from "../infrastructure/database/repositories/audit-log.repository";
import { DecisionLogRepository } from "../infrastructure/database/repositories/decision-log.repository";
import { SystemLogRepository } from "../infrastructure/database/repositories/system-log.repository";

// Services
import { AuditLogService } from "../application/services/audit-log.service";
import { DecisionLogService } from "../application/services/decision-log.service";
import { SystemLogService } from "../application/services/system-log.service";

export const registerAuditWriterModule = (): void => {
  // Register Models
  container.register(TOKENS_AUDIT_WRITER.models.auditLog, { useValue: AuditLogModel });
  container.register(TOKENS_AUDIT_WRITER.models.decisionLog, { useValue: DecisionLogModel });
  container.register(TOKENS_AUDIT_WRITER.models.systemLog, { useValue: SystemLogModel });

  // Register Repositories
  container.registerSingleton(TOKENS_AUDIT_WRITER.repos.auditLogRepo, AuditLogRepository);
  container.registerSingleton(TOKENS_AUDIT_WRITER.repos.decisionLogRepo, DecisionLogRepository);
  container.registerSingleton(TOKENS_AUDIT_WRITER.repos.systemLogRepo, SystemLogRepository);

  // Register Services
  container.registerSingleton(TOKENS_AUDIT_WRITER.services.auditLogService, AuditLogService);
  container.registerSingleton(TOKENS_AUDIT_WRITER.services.decisionLogService, DecisionLogService);
  container.registerSingleton(TOKENS_AUDIT_WRITER.services.systemLogService, SystemLogService);

  // Alias for compatibility if auditService is requested
  container.register(TOKENS_AUDIT_WRITER.services.auditService, {
    useToken: TOKENS_AUDIT_WRITER.services.auditLogService
  });
  
  // Alias for repository if auditRepo is requested
  container.register(TOKENS_AUDIT_WRITER.repos.auditRepo, {
    useToken: TOKENS_AUDIT_WRITER.repos.auditLogRepo
  });
};