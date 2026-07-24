import { CreateTenantUseCase } from "@/core/tenant/application/usecase/create-tenant.use-case";
import { GetTenantUseCase } from "@/core/tenant/application/usecase/get-tenant.use-case";
import { ListTenantsUseCase } from "@/core/tenant/application/usecase/list-tenants.use-case";
import { SuspendTenantUseCase } from "@/core/tenant/application/usecase/suspend-tenant.use-case";
import { SwitchTenantUseCase } from "@/core/tenant/application/usecase/switch-tenant.use-case";
import { UpdateTenantUseCase } from "@/core/tenant/application/usecase/update-tenant.use-case";
import { TenantRepository } from "@/core/tenant/domain/repos/tenant.repository";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";
import TenantModel from "@/core/tenant/infrastructure/models/tenant.model";
import { EventBus } from "@/core/tenant/infrastructure/services/event-bus.service";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { DependencyContainer } from "tsyringe";


export function registerTenantDependencies(container: DependencyContainer) {
  // Infrastructure
  container.register(TOKENS_TENANT.models.tenant, { useValue: TenantModel });
  container.register(TOKENS_TENANT.models.membership, { useValue: MembershipModel });
  container.registerSingleton(TOKENS_TENANT.services.eventBus, EventBus);
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.repos.membershipRepo, { useClass: MembershipRepository });

  // Use Cases
  container.register(TOKENS_TENANT.useCases.createTenant, { useClass: CreateTenantUseCase });
  container.register(TOKENS_TENANT.useCases.updateTenant, { useClass: UpdateTenantUseCase });
  container.register(TOKENS_TENANT.useCases.suspendTenant, { useClass: SuspendTenantUseCase });
  container.register(TOKENS_TENANT.useCases.listTenants, { useClass: ListTenantsUseCase });
  container.register(TOKENS_TENANT.useCases.getTenant, { useClass: GetTenantUseCase });
  container.register(TOKENS_TENANT.useCases.switchTenant, { useClass: SwitchTenantUseCase });

  return container;
}