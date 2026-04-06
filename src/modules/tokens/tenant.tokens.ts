export const TOKENS_TENANT = {
    tenantClient: Symbol.for("tenant.tenantClient"),
    models: {
        tenant: Symbol.for("tenant.models.tenant"),
        membership: Symbol.for("tenant.models.membership"),
    },
    repos: {
        tenantRepo: Symbol.for("tenant.repos.tenantRepo"),
        membershipRepo: Symbol.for("tenant.repos.membershipRepo"),
    },
    adapters: {
        userAdapter: Symbol.for("tenant.adapters.userAdapter"),
    },
    services: {
        tenantService: Symbol.for("tenant.services.tenantService"),
    }
} as const;
