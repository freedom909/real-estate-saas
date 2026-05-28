export const TOKENS_Host = {
    hostClient: Symbol.for("host.hostClient"),
    models: {
        host: Symbol.for("host.models.host"),
        membership: Symbol.for("host.models.membership"),
    },
    repos: {
        hostRepo: Symbol.for("host.repos.hostRepo"),
        membershipRepo: Symbol.for("host.repos.membershipRepo"),
    },
    adapters: {
        userAdapter: Symbol.for("host.adapters.userAdapter"),
    },
    services: {
        hostService: Symbol.for("host.services.hostService"),
    }
} as const;
