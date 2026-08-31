// src/modules/container/audit.register.ts
import { DependencyContainer } from 'tsyringe';
import { TOKENS_AUDIT } from '../tokens/audit.tokens';
import { TOKENS_SECURITY } from '@/modules/tokens/security.tokens';
import RiskCalculator from '@/security/domain/riskCalculator';
import { SecurityAIService } from '@/security/infrastructure/openaiSecurity.service';
import { GraphQLClient } from 'graphql-request';
import AuditClient from '@/packages/audit-sdk/src/client/audit.client';

import { RiskEventRepo } from '@/subgraphs/auth/infrastructure/repos/risk.event.repo';
import { AuditLogger } from '@/core/audit/application/write/services/audit.logger';
import { GetAuditLogsQuery } from '@/core/audit/application/read/queries/get-audit-logs.query';
import { AuditLogRepository } from '@/core/audit/infrastructure/repositories/auditLog.repository';
import { DecisionLogRepository } from '@/core/audit/infrastructure/repositories/decision-log.repository';
import { SystemLogRepository } from '@/core/audit/infrastructure/repositories/system-log.repository';
import { AuditLogModel } from '@/core/audit/domain/value-objects/audit-log.model';
import { DecisionLogModel } from '@/core/audit/infrastructure/models/decision-log.model';
import { SystemLogModel } from '@/core/audit/infrastructure/models/system-log.model';

function registerAuditDependencies(container: DependencyContainer) {
  container.register(TOKENS_SECURITY.services.securityAIService, {
    useClass: SecurityAIService,
  });

  container.register(TOKENS_SECURITY.services.riskCalculator, {
    useClass: RiskCalculator,
  });

  container.register(TOKENS_SECURITY.services.riskEventRepo, {
    useClass: RiskEventRepo,
  });

  container.register(TOKENS_AUDIT.auditClient, {
    useValue: new AuditClient(
      process.env.AUDIT_SUBGRAPH_URL || 'http://localhost:4080/graphql'
    ),
  });

  container.register(TOKENS_AUDIT.graphqlClient, {
    useValue: new GraphQLClient(
      process.env.AUDIT_SUBGRAPH_URL || 'http://localhost:4080/graphql'
    ),
  });

  // === Models ===
  container.register(TOKENS_AUDIT.models.auditLogModel, {
    useValue: AuditLogModel,
  });
  container.register(TOKENS_AUDIT.models.decisionLog, {
    useValue: DecisionLogModel,
  });
  container.register(TOKENS_AUDIT.models.systemLogModel, {
    useValue: SystemLogModel,
  });
  container.register(TOKENS_AUDIT.models.audit, {
    useValue: AuditLogModel,
  });

  // === Repositories ===
  container.register(TOKENS_AUDIT.repos.auditLogRepository, {
    useClass: AuditLogRepository,
  });
  container.register(TOKENS_AUDIT.repos.auditRepo, {
    useClass: AuditLogRepository,
  });
  container.register(TOKENS_AUDIT.repos.decisionLogRepo, {
    useClass: DecisionLogRepository,
  });
  container.register(TOKENS_AUDIT.repos.systemLogRepo, {
    useClass: SystemLogRepository,
  });

  // === Services ===
  container.register(TOKENS_AUDIT.services.auditLogger, {
    useClass: AuditLogger,
  });
  container.register(TOKENS_AUDIT.services.getAuditLogsQuery, {
    useClass: GetAuditLogsQuery,
  });
}

export default registerAuditDependencies;
