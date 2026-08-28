import { OAuthCredential, OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";


interface FacebookUser {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export class FacebookOAuthProvider
  implements OAuthProvider {

  async authenticate(
    credential: OAuthCredential
  ): Promise<OAuthProfile> {

    // 1. credential.code
    if (!credential.code) {
      throw new Error(
        "Facebook OAuth code is required"
      );
    }

    // 2. Facebook code → access_token
    const accessToken =
      await this.exchangeFacebookCode(
        credential.code
      );

    // 3. GET /me
    const user =
      await this.getFacebookProfile(
        accessToken
      );

    // 4. Convert to OAuthProfile
    return {
      provider: "facebook",
      providerId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.picture?.data?.url,
    };
  }

  private async exchangeFacebookCode(
    code: string
  ): Promise<string> {

    const params = new URLSearchParams({
      client_id:
        process.env.FACEBOOK_CLIENT_ID!,
      client_secret:
        process.env.FACEBOOK_CLIENT_SECRET!,
      redirect_uri:
        `${
          process.env.NEXTAUTH_URL ??
          "http://localhost:3000"
        }/api/auth/callback/facebook`,
      code,
    });

    const res = await fetch(
      "https://graph.facebook.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(
        `Facebook token exchange failed: ${
          data.error?.message ??
          data.error ??
          res.statusText
        } - ${
          data.error_description ?? ""
        }`
      );
    }

    if (!data.access_token) {
      throw new Error(
        "Facebook access token is missing"
      );
    }

    return data.access_token;
  }

  private async getFacebookProfile(
    accessToken: string
  ): Promise<FacebookUser> {

    const res = await fetch(
      "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(
        `Facebook profile fetch failed: ${
          data.error?.message ??
          data.error ??
          res.statusText
        }`
      );
    }

    return data;
  }
}
