export const TOKENS_TENANT = {
    tenantClient: Symbol.for("tenant.tenantClient"),
    models: {
        tenant: Symbol.for("tenant.models.tenant"),
        membership: Symbol.for("tenant.models.membership"),
      
    },
    repos: {
        tenantRepo: Symbol.for("tenant.repos.tenantRepo"),
        membershipRepo: Symbol.for("tenant.repos.membershipRepo"),
        userRepo: Symbol.for("tenant.repos.userRepo"),
    },
    adapters: {
        userAdapter: Symbol.for("tenant.adapters.userAdapter"),
        membershipAdapter: Symbol.for("tenant.adapters.membershipAdapter"),
    },
    services: {
        tenantService: Symbol.for("tenant.services.tenantService"),
        membershipService: Symbol.for("tenant.services.membershipService"),   
        eventBus: Symbol.for("tenant.services.eventBus"),
    },

    events: {
        tenantCreated: Symbol.for("tenant.events.tenantCreated"),
    },
   useCases: {
    createTenant: Symbol.for("createTenantUseCase"),
    updateTenant: Symbol.for("updateTenantUseCase"),
    suspendTenant: Symbol.for("suspendTenantUseCase"),
    getTenant: Symbol.for("getTenantUseCase"),
    listTenants: Symbol.for("listTenantsUseCase"),
    switchTenant: Symbol.for("switchTenantUseCase"),
  },
} as const;

