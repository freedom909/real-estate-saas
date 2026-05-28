// infrastructure/oauth/provider.registry.ts

import { OAuthProvider } from "../../domain/services/oauthProvider.interface";

export class ProviderRegistry {
  constructor(
    private providers: Record<string, OAuthProvider>
  ) {}

  get(provider: string): OAuthProvider {
    const p = this.providers[provider];

    if (!p) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return p;
  }
}