// FILE: src/subgraphs/owner/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';

import  UserModel  from '../../subgraphs/user/models/user.model';
import UserRepository from '../../subgraphs/user/repos/user.repo';
import { TOKENS_USER } from '@/modules/tokens/user.tokens';
import MembershipModel from '@/subgraphs/user/models/membership.model';


import { TOKENS_TENANT } from '../tokens/tenant.tokens';
import { Tenant } from '@/core/tenant/domain/entities/tenant.entity';
import { TenantRepository } from '@/core/tenant/infrastructure/repos/tenant.repository';
import { MembershipRepository } from '@/core/tenant/infrastructure/repos/membership.repo';
import { UserAdapter } from '@/core/tenant/adapter/user.adapter';

function registerTenantDependencies(container: DependencyContainer): DependencyContainer {
  container.register(TOKENS_TENANT.models.tenant, { useValue: Tenant });
  container.register(TOKENS_TENANT.models.membership, { useValue: MembershipModel }); 

  container.register(TOKENS_USER.models.user, { useValue: UserModel });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.repos.membershipRepo, { useClass: MembershipRepository });
  
  container.register(TOKENS_USER.repos.userRepo, { useClass: UserRepository });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.adapters.userAdapter, { useClass: UserAdapter });
  
  // container.register(TOKENS_TENANT.services.membershipService, { useClass: MembershipService });
  // container.register(TOKENS_TENANT.services.tenantService, { useClass: TenantService });



  return container;
}
export default registerTenantDependencies;
