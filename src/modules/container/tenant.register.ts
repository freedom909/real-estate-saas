// FILE: src/subgraphs/host/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';

import  UserModel  from '../../subgraphs/user/models/user.model';
import UserRepository from '../../subgraphs/user/repos/user.repo';
import { TOKENS_USER } from '@/modules/tokens/user.tokens';
import MembershipModel from '@/subgraphs/user/models/membership.model';

import { MembershipRepository } from '@/subgraphs/tenant/repos/membership.repo';
import { UserAdapter } from '@/subgraphs/tenant/services/user.adapter';
import { HostService } from '@/subgraphs/tenant/services/tenant.service';
import { TOKENS_TENANT } from '../tokens/tenant.tokens';

function registerTenantDependencies(container: DependencyContainer): DependencyContainer {
  container.register(TOKENS_TENANT.models.tenant, { useValue: TenantModel });
  container.register(TOKENS_TENANT.models.membership, { useValue: MembershipModel }); 

  // Register Redis placeholder to satisfy UserRepository dependency
  container.register(Symbol.for("infra.redis"), { useValue: {} });

  container.register(TOKENS_USER.models.user, { useValue: UserModel });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.repos.membershipRepo, { useClass: MembershipRepository });
  
  container.register(TOKENS_USER.repos.userRepo, { useClass: UserRepository });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.adapters.userAdapter, { useClass: UserAdapter });
  
  container.register(TOKENS_TENANT.services.membershipService, { useClass: MembershipService });
  container.register(TOKENS_TENANT.services.tenantService, { useClass: TenantService });



  return container;
}
export default registerTenantDependencies;
