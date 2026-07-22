// infrastructure/oauth/facebook.provider.ts

import { OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export class FacebookProvider implements OAuthProvider {
  async verify(accessToken: string): Promise<OAuthProfile> {
    console.log("👉 Facebook verify called");

    if (!accessToken) {
      throw new Error("FACEBOOK_ACCESS_TOKEN_REQUIRED");
    }

    // 1️⃣ Fetch user info from Graph API
    const fields = "id,name,email,picture.width(200)";
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=${fields}&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FACEBOOK_API_ERROR: ${response.status} ${error}`);
    }

    const user: FacebookUser = await response.json();

    // 2️⃣ Map to unified OAuthProfile
    return {
      provider: "facebook",
      providerId: user.id,
      email: user.email ?? undefined,
      emailVerified: true, // Facebook emails are verified
      name: user.name ?? undefined,
      avatar: user.picture?.data?.url ?? undefined,
      sub: user.id,
    };
  }
}
