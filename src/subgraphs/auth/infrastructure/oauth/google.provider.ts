// infrastructure/oauth/google.provider.ts

import verifyGoogleIdToken from "../../application/services/verifyGoogleIdToken";
import { OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";



export class GoogleProvider implements OAuthProvider {
  async verify(idToken: string): Promise<OAuthProfile> {
    console.log("👉 Google verify called");

    // 1️⃣ 验证 token
    const raw = await verifyGoogleIdToken(idToken);

    // 2️⃣ 统一结构（原 map 逻辑）
    return {
      provider: raw.provider || "google",
      providerId: raw.sub,
      email: raw.email ?? undefined,
      emailVerified: raw.emailVerified ?? undefined,
      name: raw.name?? undefined,
      avatar: raw.picture?? undefined,
      sub: raw.sub,
      iss: raw.iss?? undefined,
    }
  }
}