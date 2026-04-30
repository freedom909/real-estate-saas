// domain/valueObjects/oauthProfile.vo.ts

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

