import { container, DependencyContainer } from 'tsyringe';

import { TOKENS_AUDIT } from '../tokens/audit.tokens';
import { AuditLogService } from '../audit/application/write/services/audit-log.service';
import { AuditLogRepository } from '../audit/infrastructure/database/repositories/audit-log.repository';
import { AuditLogModel } from '../audit/infrastructure/database/models/audit-log.model';

import { DecisionLogService } from '../audit/application/write/services/decision-log.service';

import { DecisionLogModel } from '../audit/infrastructure/database/models/decision-log.model';

import { SystemLogService } from '../audit/application/write/services/system-log.service';
import { SystemLogRepository } from '../audit/infrastructure/database/repositories/system-log.repository';
import { SystemLogModel } from '../audit/infrastructure/database/models/system-log.model';

import { GetAuditLogsQuery } from '../audit/application/read/queries/get-audit-logs.query';
import { GetAuditLogsByResourceQuery } from '../audit/application/read/queries/get-audit-logs-by-resource.query';

import { GetDecisionLogsQuery } from '../audit/application/read/queries/get-decision-logs.query';
import { GetSystemLogsQuery } from '../audit/application/read/queries/get-system-logs.query';
import { DecisionLogRepository } from '../audit/infrastructure/database/repositories/decision-log.repository';


export function registerAuditDependencies(): void {

  // models
  container.register(
    TOKENS_AUDIT.models.auditLog,
    { useValue: AuditLogModel }
  );

  container.register(
    TOKENS_AUDIT.models.decisionLog,
    { useValue: DecisionLogModel }
  );

  container.register(
    TOKENS_AUDIT.models.systemLog,
    { useValue: SystemLogModel }
  );

  // repositories
  container.registerSingleton(
    TOKENS_AUDIT.repos.auditLog,
    AuditLogRepository
  );

  container.registerSingleton(
    TOKENS_AUDIT.repos.decisionLog,
    DecisionLogRepository
  );

  container.registerSingleton(
    TOKENS_AUDIT.repos.systemLog,
    SystemLogRepository
  );

  // write services
  container.registerSingleton(
    TOKENS_AUDIT.services.auditLog,
    AuditLogService
  );

  container.registerSingleton(
    TOKENS_AUDIT.services.decisionLog,
    DecisionLogService
  );

  container.registerSingleton(
    TOKENS_AUDIT.services.systemLog,
    SystemLogService
  );

  // read queries
  container.registerSingleton(
    TOKENS_AUDIT.queries.getAuditLogs,
    GetAuditLogsQuery
  );

  container.registerSingleton(
    TOKENS_AUDIT.queries.getAuditLogsByResource,
    GetAuditLogsByResourceQuery
  );

  container.registerSingleton(
    TOKENS_AUDIT.queries.getDecisionLogs,
    GetDecisionLogsQuery
  );

  container.registerSingleton(
    TOKENS_AUDIT.queries.getSystemLogs,
    GetSystemLogsQuery
  );
}

export default registerAuditDependencies;

