import { OAuthAdapter } from "../oauth/oauth.adapter"
import { NormalizedOAuthProfile } from "../normalized.oauth.profile"
import { OAuthProvider } from "../oauth/oauth.provider"
import { injectable } from "tsyringe"

import githubIdToken from "../verifiers/github.code"

@injectable()
export default class GithubOAuthAdapter implements OAuthAdapter {
 
  provider = OAuthProvider.GITHUB
  async map(raw: any): Promise<NormalizedOAuthProfile> {
    return {
      provider: this.provider,
      providerAccountId: raw.sub,

      // 🔥 关键：处理 null
      email: raw.email ?? undefined,
      emailVerified: raw.email_verified ?? false,

      name: raw.name ?? undefined,
      avatar: raw.picture ?? undefined,

      sub: raw.providerUserId
    }
  }
  
  async verify(idToken: string): Promise<NormalizedOAuthProfile> {
    console.log("👉 Github verify called");

    const raw = await githubIdToken(idToken);

    return {
      provider: this.provider,
      providerAccountId: raw.providerUserId,

      email: raw.email ?? undefined,
      name: raw.name ?? undefined,
      avatar: raw.avatar ?? undefined,

      // ✅ 推荐：删掉（如果没用）,if reomved, it is wrong
       sub: raw.providerUserId
    }
  }
}