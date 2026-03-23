import { OAuthAdapter } from "../oauth/oauth.adapter"
import { NormalizedOAuthProfile } from "../normalized.oauth.profile"
import { OAuthProvider } from "../oauth/oauth.provider"

// 👉 你需要这个
import  verifyGoogleIdToken  from "../verifiers/verify.google.idToken" 
import { injectable } from "tsyringe"

@injectable()
export class GoogleOAuthAdapter implements OAuthAdapter {
  async map(raw: any): Promise<NormalizedOAuthProfile> {
    return {
      provider: this.provider,
      providerAccountId: raw.sub,

      // 🔥 关键：处理 null
      email: raw.email ?? undefined,
      emailVerified: raw.email_verified ?? false,

      name: raw.name ?? undefined,
      avatar: raw.picture ?? undefined,
      sub: raw.sub,
      iss: raw.iss?? undefined,
    }
  }


  provider = OAuthProvider.GOOGLE

  async verify(idToken: string): Promise<NormalizedOAuthProfile> {
    console.log("👉 Google verify called");

    // 1️⃣ 验证 token
    const raw = await verifyGoogleIdToken(idToken);

    // 2️⃣ 统一结构（原 map 逻辑）
    return {
      provider: this.provider,
      providerAccountId: raw.sub,
      email: raw.email ?? undefined,
      emailVerified: raw.emailVerified ?? undefined,
      name: raw.name?? undefined,
      avatar: raw.picture?? undefined,
      sub: raw.sub,
      iss: raw.iss?? undefined,
    }
  }
}


