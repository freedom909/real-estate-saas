export const TENANT_TOKENS = {
    tenantClient: Symbol.for("tenant.tenantClient"),
    models: {
        tenant: Symbol.for("tenant.models.tenant"),
        membership: Symbol.for("tenant.models.membership"),
    },
    repos: {
        tenantRepo: Symbol.for("tenant.repos.tenantRepo"),
        membershipRepo: Symbol.for("tenant.repos.membershipRepo"),
    },
    services: {
        tenantService: Symbol.for("tenant.services.tenantService"),
    }
} as const;
