//src/subgraphs/auth/infrastructure/oauth/google.oauthProvider.ts
import { OAuthCredential, OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";
import { OAuth2Client } from "google-auth-library";

interface GoogleIdTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  iss?: string;
}

export class GoogleOAuthProvider implements OAuthProvider {
  private readonly client =  new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID
    )
 
  async authenticate(credential: OAuthCredential): Promise<OAuthProfile> {
     // 1. credential.idToken
    if (!credential.idToken) {
      throw new Error("Google OAuth idToken is required");
    }

    const ticket = await this.client.verifyIdToken({
      idToken: credential.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() as GoogleIdTokenPayload;
    if (!payload) {
      throw new Error("Google idToken payload is required");
    }
    if (!payload) {
      throw new Error(
        "INVALID_GOOGLE_TOKEN"
      );
    }

    if (!payload.sub) {
      throw new Error(
        "GOOGLE_SUB_REQUIRED"
      );
    }

    return {
      provider: "google",
      providerId: payload.sub,
      email: payload.email ?? undefined,
      name: payload.name ?? undefined,
      avatar: payload.picture ?? undefined,
      sub: payload.sub,
      iss: payload.iss,
      emailVerified: payload.email_verified ?? false,
    };
}

    private async getGoogleProfile(accessToken: string) {
    // Google userinfo endpoint
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Google profile fetch failed: ${res.statusText} - ${data.message || ""}`);
    }
    return data;
    }
  }
