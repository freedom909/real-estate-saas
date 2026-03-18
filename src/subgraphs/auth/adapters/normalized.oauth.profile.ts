// adapters/oauth/oauth.types.ts
 enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
  APPLE = "apple",
  FACEBOOK = "facebook",
  LINKEDIN = "linkedin",
  LINE="line"
}

 interface NormalizedOAuthProfile {
  provider: OAuthProvider;
  sub: string;
  email?: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean
  providerAccountId: string
}

export { OAuthProvider};
export type { NormalizedOAuthProfile };

