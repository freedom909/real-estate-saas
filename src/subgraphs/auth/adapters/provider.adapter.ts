// adapters/oauth/oauthProviderAdapter.ts
import {  NormalizedOAuthProfile } from "./normalized.oauth.profile";

export interface ProviderAdapter {
  parse(idToken: string): Promise<NormalizedOAuthProfile>;
}

