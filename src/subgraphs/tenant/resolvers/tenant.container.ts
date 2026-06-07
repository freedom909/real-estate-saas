import { DependencyContainer } from "tsyringe";
import { TOKENS_TENANT } from "../domain/entities/tenant.tokens";

import { TenantModel } from "../infrastructure/models/tenant.model";
import { EventBus } from "../infrastructure/services/event-bus.service";
import { CreateTenantUseCase } from "../application/usecase/create-tenant.use-case";
import { UpdateTenantUseCase } from "../application/usecase/update-tenant.use-case";
import { SuspendTenantUseCase } from "../application/usecase/suspend-tenant.use-case";
import { ListTenantsUseCase } from "../application/usecase/list-tenants.use-case";
import { GetTenantUseCase } from "../application/usecase/get-tenant.use-case";
import { TenantRepository } from "../infrastructure/repos/tenant.repository";

export function registerTenantDependencies(container: DependencyContainer) {
  // Infrastructure
  container.register(TOKENS_TENANT.models.tenantModel, { useValue: TenantModel });
  container.registerSingleton(TOKENS_TENANT.services.eventBus, EventBus);
  container.register(TOKENS_TENANT.repositories.tenantRepo, { useClass: TenantRepository });

  // Use Cases
  container.register(TOKENS_TENANT.useCases.createTenant, { useClass: CreateTenantUseCase });
  container.register(TOKENS_TENANT.useCases.updateTenant, { useClass: UpdateTenantUseCase });
  container.register(TOKENS_TENANT.useCases.suspendTenant, { useClass: SuspendTenantUseCase });
  container.register(TOKENS_TENANT.useCases.listTenants, { useClass: ListTenantsUseCase });
  container.register(TOKENS_TENANT.useCases.getTenant, { useClass: GetTenantUseCase });

  return container;
}