// domain/services/oauthProvider.interface.ts

export interface OAuthProfile {
  provider: string;
  providerId: string; // ⭐ 必须
  email?: string;
  name?: string;
  avatar?: string;
  sub?: string;
  iss?: string;
  emailVerified?: boolean;
}

export interface OAuthProvider {
  verify(idToken: string): Promise<OAuthProfile>;
}