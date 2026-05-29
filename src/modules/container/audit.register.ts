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
import { SecurityLogService } from '@/security/infrastructure/services/securityLog.service';
import { SecurityLogRepository } from '@/security/infrastructure/repos/securityLog.repository';
import { SecurityLogModel } from '@/security/infrastructure/models/securityLog.model';


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

  container.register(
    TOKENS_AUDIT.models.securityLog,
    { useValue: SecurityLogModel } // please give me this code
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

  container.registerSingleton(
    TOKENS_AUDIT.repos.securityLog,
    SecurityLogRepository // please give me this code
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

  container.registerSingleton(
    TOKENS_AUDIT.services.securityLog,
    SecurityLogService // please give me this code
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
