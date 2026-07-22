import { gql } from "@apollo/client";

export const OAUTH_LOGIN = gql`
  mutation OAuthLogin($provider: OAuthProvider!, $idToken: String!) {
    oauthLogin(provider: $provider, idToken: $idToken) {
      accessToken
      refreshToken
      user {
        id
        role
      }
    }
  }
`;