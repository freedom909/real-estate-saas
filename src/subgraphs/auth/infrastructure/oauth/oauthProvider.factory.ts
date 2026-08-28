//src/subgraphs/auth/infrastructure/oauth/oauthProvider.factory.ts

import {
  OAuthProvider,
  OAuthProviderType,
} from "../../domain/services/oauthProvider.interface";

import { GoogleOAuthProvider } from "./google.oauthProvider";
import { GitHubOAuthProvider } from "./github.oauthProvider";
import { FacebookOAuthProvider } from "./facebook.oauthProvider";

const providers: Record<
  OAuthProviderType,
  OAuthProvider
> = {
  google: new GoogleOAuthProvider(),
  github: new GitHubOAuthProvider(),
  facebook: new FacebookOAuthProvider(),
};

export function getOAuthProvider(
  provider: string
): OAuthProvider {

  if (!(provider in providers)) {
    throw new Error(
      `Unsupported OAuth provider: ${provider}`
    );
  }

  return providers[
    provider as OAuthProviderType
  ];
}