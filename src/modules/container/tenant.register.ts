// FILE: src/subgraphs/host/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';

import  UserModel  from '../../subgraphs/user/models/user.model';
import UserRepository from '../../subgraphs/user/repos/user.repo';


import { TOKENS_USER } from '@/modules/tokens/user.tokens';
import { TOKENS_Host } from '../tokens/tenant.tokens';
import { HostModel } from '@/subgraphs/tenant/tenant.model';
import MembershipModel from '@/subgraphs/user/models/membership.model';
import { HostRepository } from '@/subgraphs/tenant/repos/tenant.repo';
import { MembershipRepository } from '@/subgraphs/tenant/repos/membership.repo';
import { UserAdapter } from '@/subgraphs/tenant/services/user.adapter';
import { HostService } from '@/subgraphs/tenant/services/tenant.service';

function registerTenantDependencies(container: DependencyContainer): DependencyContainer {
  container.register(TOKENS_Host.models.host, { useValue: HostModel });
  container.register(TOKENS_Host.models.membership, { useValue: MembershipModel }); 

  // Register Redis placeholder to satisfy UserRepository dependency
  container.register(Symbol.for("infra.redis"), { useValue: {} });

  container.register(TOKENS_USER.models.user, { useValue: UserModel });
  container.register(TOKENS_Host.repos.hostRepo, { useClass: HostRepository });
  container.register(TOKENS_Host.repos.membershipRepo, { useClass: MembershipRepository });
  
  container.register(TOKENS_USER.repos.userRepo, { useClass: UserRepository });
  container.register(TOKENS_Host.adapters.userAdapter, { useClass: UserAdapter });
  container.register(TOKENS_Host.services.hostService, { useClass: HostService });

  return container;
}
export default registerTenantDependencies;
