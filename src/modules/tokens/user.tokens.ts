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
      createOAuthRepository: Symbol.for("user.usecase.createOAuthRepository"),
    },

    services: {
      userService: Symbol.for("user.services.userService"),
    },

    usecase: {
      createOAuthUserUseCase: Symbol.for("user.usecase.createOAuthUserUseCase"),
    },

    mergeAccountService: Symbol.for("user.services.mergeAccountService"),
  
}