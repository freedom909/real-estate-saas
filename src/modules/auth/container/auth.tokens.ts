  
  export const TOKENS_AUTH = {
  
    // adapters
    adapters: {
      oauthAdapter: Symbol.for("auth.adapters.oauthAdapter"),
      oauthAdapterRegistry: Symbol.for("auth.adapters.oauthAdapterRegistry"),
      googleOAuthAdapter: Symbol.for("auth.adapters.googleOAuthAdapter"),
      githubOAuthAdapter: Symbol.for("auth.adapters.githubOAuthAdapter"),
      appleOAuthAdapter: Symbol.for("auth.adapters.appleOAuthAdapter"),
      facebookOAuthAdapter: Symbol.for("auth.adapters.facebookOAuthAdapter"),
    },

    // models
    models: {
      credential: Symbol.for("auth.models.credential"),
      refreshToken: Symbol.for("auth.models.refreshToken"),
      
      session: Symbol.for("auth.models.session"),
      riskEvent: Symbol.for("auth.models.riskEvent"),
    },

    // repositories
    repos: {
      credentialRepo: Symbol.for("auth.repos.credentialRepo"),
      refreshTokenRepo: Symbol.for("auth.repos.refreshTokenRepository"),
      
      sessionRepo: Symbol.for("auth.repos.sessionRepo"),
      riskEventRepo: Symbol.for("auth.repos.riskEventRepo"),
    },

    // services
    services: {
      authService: Symbol.for("auth.services.authService"),
      tokenService: Symbol.for("auth.services.tokenService"),
      refreshTokenService: Symbol.for("auth.services.refreshTokenService"),
      oauthService: Symbol.for("auth.services.oauthService"),
      sessionService: Symbol.for("auth.services.sessionService"),
      
      loginRiskService: Symbol.for("auth.services.loginRiskService"),
      mergeAccountService: Symbol.for("auth.services.mergeAccountService"),
      unlinkAccountService: Symbol.for("auth.services.unlinkAccountService"),
      oauthloginService: Symbol.for("auth.services.oauthloginService"),     
    },

    // providers
    providers: {
      keyProvider: Symbol.for("auth.providers.keyProvider"),
      envKeyProvider: Symbol.for("auth.providers.envKeyProvider"),
    },
    PRIVATE_KEY: "PRIVATE_KEY",
    PUBLIC_KEY: "PUBLIC_KEY",

    // guards
    guards: {
      authGuard: Symbol.for("auth.guards.authGuard"),
    }
  
};