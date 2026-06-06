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
    }
} as const;
