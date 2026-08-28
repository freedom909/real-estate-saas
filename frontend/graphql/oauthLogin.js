import { gql } from "@apollo/client";

export const OAUTH_LOGIN = gql`
 mutation OAuthLogin(
    $provider: OAuthProvider!,
    $credential: OAuthCredentialInput!
  ) {
    oauthLogin(
      provider: $provider,
      credential: $credential
    ) {
      accessToken
      refreshToken

      user {
        id
        email
        name
        picture
        role
      }
    }
  }
`;