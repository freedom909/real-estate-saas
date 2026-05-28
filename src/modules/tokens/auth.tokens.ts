import ChallengeRepo from "@/subgraphs/auth/infrastructure/repos/challenge.repo";

export const TOKENS_AUTH = {

  // adapters
  adapters: {
    oauthAdapter: Symbol.for("auth.adapters.oauthAdapter"),
    userClient: Symbol.for("auth.adapters.userClient"),
    oauthAdapterRegistry: Symbol.for("auth.adapters.oauthAdapterRegistry"),
    googleOAuthAdapter: Symbol.for("auth.adapters.googleOAuthAdapter"),
    githubOAuthAdapter: Symbol.for("auth.adapters.githubOAuthAdapter"),
    appleOAuthAdapter: Symbol.for("auth.adapters.appleOAuthAdapter"),
    facebookOAuthAdapter: Symbol.for("auth.adapters.facebookOAuthAdapter"),
  },

  // models
  models: {
    credential: Symbol.for("auth.models.credential"),
    session: Symbol.for("auth.model.session"),
    refreshToken: Symbol.for("auth.model.refreshToken"),
    riskEvent: Symbol.for("auth.models.riskEvent"),
    trustedDevice: Symbol.for("auth.models.trustedDevice"),
    challengeModel: Symbol.for("auth.models.challengeModel"),
    identityModel: Symbol.for("auth.models.identityModel"),
  },

  // repositories
  repos: {
    credentialRepo: Symbol.for("auth.repos.credentialRepo"),
    refreshTokenRepo: Symbol.for("auth.repos.refreshTokenRepository"),
    sessionRepo: Symbol.for("auth.repos.sessionRepo"),
    riskEventRepo: Symbol.for("auth.repos.riskEventRepo"),
    challengeRepo: Symbol.for("auth.repos.challengeRepo"), 
    userRepo: Symbol.for("auth.repos.userRepo"),
    identityRepo: Symbol.for("auth.repos.identityRepo"),
    ChallengeRepo: Symbol.for("auth.repos.challengeRepo"),
  },

  // services
  services: {
    authService: Symbol.for("auth.services.authService"),
    tokenService: Symbol.for("auth.services.tokenService"),
    refreshTokenService: Symbol.for("auth.services.refreshTokenService"),
    oauthService: Symbol.for("auth.services.oauthService"),
    sessionService: Symbol.for("auth.services.sessionService"),
    otpService: Symbol.for("auth.services.otpService"),

    // loginRiskService: Symbol.for("auth.services.loginRiskService"),
    mergeAccountService: Symbol.for("auth.services.mergeAccountService"),
    unlinkAccountService: Symbol.for("auth.services.unlinkAccountService"),
    oauthLoginService: Symbol.for("auth.services.oauthLoginService"),
    serviceTokenService: Symbol.for("auth.serviceTokenService"),
  },

    usecases: {
    OAuthLoginUseCase: Symbol.for("usecases.OAuthLoginUseCase"),
    verifyOtpUseCase: Symbol.for("auth.VerifyOtpUseCase"), // ✅ 放这里
    oauthLoginUseCase: Symbol.for("auth.OAuthLoginUseCase"),
    providerRegistry: Symbol.for("auth.providerRegistry"),
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
  },
  eventBus: Symbol.for("eventBus"),
  // ports
  ports: {
  auditPort: Symbol.for("auditPort"),
  sessionPort:Symbol.for("sessionPort"),
  userGateway:Symbol.for("userGateway"),
}}
