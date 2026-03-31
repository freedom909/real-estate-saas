import { container, DependencyContainer } from 'tsyringe';
import { TOKENS_AUDIT } from './audit.tokens';
import { AuditRepository } from '../repos/audit.repository';
import { AuditService } from '../services/audit.service';
import { TOKENS_SECURITY } from '@/security/container/tokens';


import { RiskEventRepo } from '@/subgraphs/auth/repos/risk.event.repo';
import RiskCalculator from '@/security/domain/riskCalculator';
import { GeminiSecurityService } from '@/security/infrastructure/geminiSecurity.service';
import AuditModel from '../models/audit.model';
import { GraphQLClient } from 'graphql-request';
import AuditClient from '@/packages/audit-sdk/src/client/audit.client';


function registerAuditDependencies(container: DependencyContainer) {
  container.register(TOKENS_AUDIT.models.audit, { useValue: AuditModel });
  container.register(AuditRepository, { useClass: AuditRepository });
  container.register(AuditService, { useClass: AuditService });

  container.register(TOKENS_SECURITY.services.geminiSecurityService, {
    useClass: GeminiSecurityService,
  });

  container.register(TOKENS_SECURITY.services.riskCalculator, {
    useClass: RiskCalculator,
  });

  container.register(TOKENS_SECURITY.services.riskEventRepo, {
    useClass: RiskEventRepo,
  });

  container.register(TOKENS_AUDIT.auditClient, {
    useValue: new AuditClient(
      process.env.AUDIT_SUBGRAPH_URL || "http://localhost:4080/graphql"
    ),
  })

    container.register(TOKENS_AUDIT.graphqlClient, {
    useValue: new GraphQLClient(
      process.env.AUDIT_SUBGRAPH_URL || "http://localhost:4080/graphql"
    )
  });
}

export default registerAuditDependencies;