// FILE: src/subgraphs/host/container/registerDependencies.ts

import { DependencyContainer } from 'tsyringe';
import  HostModel  from '../../subgraphs/host/models/host.model';
import  MembershipModel  from '../../subgraphs/host/models/membership.model';
import { HostRepository } from '../../subgraphs/host/repos/host.repo';
import { MembershipRepository } from '../../subgraphs/host/repos/membership.repo';
import  UserModel  from '../../subgraphs/user/models/user.model';
import UserRepository from '../../subgraphs/user/repos/user.repo';
import { HostService } from '../../subgraphs/host/services/host.service';
import { TOKENS_Host } from '@/modules/tokens/host.tokens';
import { UserAdapter } from '../../subgraphs/host/services/user.adapter';

import { TOKENS_USER } from '@/modules/tokens/user.tokens';

function registerHostDependencies(container: DependencyContainer): DependencyContainer {
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
export default registerHostDependencies;