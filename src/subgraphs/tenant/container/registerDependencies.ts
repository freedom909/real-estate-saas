// FILE: src/subgraphs/tenant/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';
import  TenantModel  from '../models/tenant.model';
import  MembershipModel  from '../models/membership.model';
import { TenantRepository } from '../repos/tenant.repo';
import { MembershipRepository } from '../repos/membership.repo';
import { TenantService } from '../services/tenant.service';
import { TOKENS } from '../constants/tokens';

 function registerDependencies(container: DependencyContainer): DependencyContainer {
  container.register(TOKENS.TenantModel, { useValue: TenantModel });
  container.register(TOKENS.MembershipModel, { useValue: MembershipModel });

  container.register(TOKENS.TenantRepository, { useClass: TenantRepository });
  container.register(TOKENS.MembershipRepository, { useClass: MembershipRepository });

  container.register(TOKENS.TenantService, { useClass: TenantService });

  return container;
}
export default registerDependencies;