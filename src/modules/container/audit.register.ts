import { container, DependencyContainer } from 'tsyringe';
import { TOKENS_AUDIT } from '../tokens/audit.tokens';
import { TOKENS_SECURITY } from '@/modules/tokens/security.tokens';
import { TOKENS_AUTH } from '@/modules/tokens/auth.tokens';
import { TOKENS_USER } from '@/modules/tokens/user.tokens';
import RiskCalculator from '@/security/domain/riskCalculator';
import { GeminiSecurityService } from '@/security/infrastructure/geminiSecurity.service';
import { GraphQLClient } from 'graphql-request';
import AuditClient from '@/packages/audit-sdk/src/client/audit.client';
import AuditModel from '@/subgraphs/audit/models/audit.model';
import { AuditRepository } from '@/subgraphs/audit/repos/audit.repository';
import { AuditService } from '@/subgraphs/audit/services/audit.service';
import { RiskEventRepo } from '@/subgraphs/auth/infrastructure/repos/risk.event.repo';

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