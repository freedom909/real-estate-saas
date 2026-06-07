export const TOKENS_TENANT = {
  repositories: {
    tenantRepo: Symbol.for("tenantRepo"),
  },
  useCases: {
    createTenant: Symbol.for("createTenantUseCase"),
    updateTenant: Symbol.for("updateTenantUseCase"),
    suspendTenant: Symbol.for("suspendTenantUseCase"),
    getTenant: Symbol.for("getTenantUseCase"),
    listTenants: Symbol.for("listTenantsUseCase"),
  },
  services: {
    eventBus: Symbol.for("eventBus"),
  },
  models: {
    tenantModel: Symbol.for("tenantModel"),
  }
};