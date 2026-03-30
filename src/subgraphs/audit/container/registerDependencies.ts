import { container, DependencyContainer } from 'tsyringe';
import { AuditLogModel, AuditLogModelToken } from '../models/audit.model';
import { AuditRepository } from '../repos/audit.repository';
import { AuditService } from '../services/audit.service';
import { TOKENS_SECURITY } from '@/security/container/tokens';


import { RiskEventRepo } from '@/subgraphs/auth/repos/risk.event.repo';
import RiskCalculator from '@/security/domain/riskCalculator';
import { GeminiSecurityService } from '@/security/infrastructure/geminiSecurity.service';


function registerAuditDependencies(container: DependencyContainer) {
  container.register(AuditLogModelToken, { useValue: AuditLogModel });
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

 
}

export default registerAuditDependencies;