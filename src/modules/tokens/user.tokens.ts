// src/modules/tokens/user.tokens.ts

/**
 * DI tokens for the User subgraph.
 *
 * All consumers (use cases, adapters, services) inject via these tokens.
 * The repository token is the single DDD interface — no legacy tokens.
 */
export const TOKENS_USER = {
  userClient: Symbol.for("user.userClient"),

  models: {
    user: Symbol.for("user.models.user"),
    profile: Symbol.for("user.models.profile"),
  },

  repos: {
    /** Single DDD repository — all consumers use this. */
    userRepository: Symbol.for("user.repos.userRepository"),
    profileRepo: Symbol.for("user.repos.profileRepo"),
    profileRepository: Symbol.for("user.repos.profileRepository"),
  },

  services: {
    userService: Symbol.for("user.services.userService"),
  },

  usecase: {
    createOAuthUserUseCase: Symbol.for("user.usecase.createOAuthUserUseCase"),
    becomeHostUseCase: Symbol.for("user.usecase.becomeHostUseCase"),
    mergeAccountUseCase: Symbol.for("user.usecase.mergeAccountUseCase"),
    profileServiceUseCase: Symbol.for("user.usecase.profileServiceUseCase"),
  },

  mergeAccountService: Symbol.for("user.services.mergeAccountService"),
};
