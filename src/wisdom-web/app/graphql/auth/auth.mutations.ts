// src/wisdom-web/app/graphql/auth/auth.mutations.ts
// auth.mutations.ts
import { gql } from "@apollo/client/core";


export const OAUTH_LOGIN = gql`
  mutation OAuthLogin($provider: OAuthProvider!, $idToken: String!) {
    oauthLogin(provider: $provider, idToken: $idToken) {
      accessToken
      refreshToken
      user {
        id
       email
       name
      }
    }
  }
`;

