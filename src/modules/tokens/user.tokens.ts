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
      userRepository: Symbol.for("user.repos.userRepository"),
    },

    services: {
      userService: Symbol.for("user.services.userService"),
    },

    usecase: {
      createOAuthUserUseCase: Symbol.for("user.usecase.createOAuthUserUseCase"),
      becomeHostUseCase: Symbol.for("user.usecase.becomeHostUseCase"),
      mergeAccountUseCase: Symbol.for("user.usecase.mergeAccountUseCase"),
    },

    mergeAccountService: Symbol.for("user.services.mergeAccountService"),
  
}