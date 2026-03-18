//src/security/container/security.tokens.ts

export const TOKENS_SECURITY ={
    security: {
    policyEngine: Symbol.for("security.policyEngine"),
    blacklist: Symbol.for("security.blacklist"),
    tokenBindingService: Symbol.for("security.tokenBindingService"),
  },
}