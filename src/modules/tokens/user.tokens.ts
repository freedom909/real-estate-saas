//src/modules/user/container/user.tokens.ts

export const TOKENS_USER={

    userClient: Symbol.for("user.userClient"),

    models: {
      user: Symbol.for("user.models.user"),
      profile: Symbol.for("user.models.profile"),
    },

    repos: {
      userRepo: Symbol.for("user.repos.userRepo"),
      profileRepo: Symbol.for("user.repos.profileRepo"),
    },

    services: {
      userService: Symbol.for("user.services.userService"),
    },
    mergeAccountService: Symbol.for("user.services.mergeAccountService"),
  
}