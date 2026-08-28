// domain/services/oauthProvider.interface.ts

export interface OAuthProfile {
  provider: OAuthProviderType;
  providerId: string; // ⭐ 必须
  email?: string;
  name?: string;
  avatar?: string;
  sub?: string;
  iss?: string;
  emailVerified?: boolean;
}

export interface OAuthProvider {
authenticate(credential: OAuthCredential): Promise<OAuthProfile>;
}

export type OAuthProviderType = "google" | "github" | "facebook";

export interface OAuthCredential {
  code?: string;
  accessToken?: string;
  idToken?: string;
}