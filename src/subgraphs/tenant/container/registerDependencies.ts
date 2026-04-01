// FILE: src/subgraphs/tenant/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';
import  TenantModel  from '../models/tenant.model';
import  MembershipModel  from '../models/membership.model';
import { TenantRepository } from '../repos/tenant.repo';
import { MembershipRepository } from '../repos/membership.repo';
import  UserModel  from '../../user/models/user.model';
import UserRepository from '../../user/repos/user.repo';
import { TenantService } from '../services/tenant.service';
import { TOKENS_TENANT } from '@/modules/tenant/container/tenant.tokens';
import { UserAdapter } from '../services/user.adapter';

import { TOKENS_USER } from '@/modules/user/container/user.tokens';

function registerDependencies(container: DependencyContainer): DependencyContainer {
  container.register(TOKENS_TENANT.models.tenant, { useValue: TenantModel });
  container.register(TOKENS_TENANT.models.membership, { useValue: MembershipModel }); 

  // Register Redis placeholder to satisfy UserRepository dependency
  container.register(Symbol.for("infra.redis"), { useValue: {} });

  container.register(TOKENS_USER.models.user, { useValue: UserModel });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.repos.membershipRepo, { useClass: MembershipRepository });
  
  container.register(TOKENS_USER.repos.userRepo, { useClass: UserRepository });
  container.register(TOKENS_TENANT.adapters.userAdapter, { useClass: UserAdapter });
  container.register(TOKENS_TENANT.services.tenantService, { useClass: TenantService });

  return container;
}
export default registerDependencies;