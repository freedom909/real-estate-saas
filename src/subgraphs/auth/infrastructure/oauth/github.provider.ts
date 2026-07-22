// infrastructure/oauth/github.provider.ts

import { OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export class GitHubProvider implements OAuthProvider {
  async verify(accessToken: string): Promise<OAuthProfile> {
    console.log("👉 GitHub verify called");

    if (!accessToken) {
      throw new Error("GITHUB_ACCESS_TOKEN_REQUIRED");
    }

    // 1️⃣ Fetch user info from GitHub API using the access token
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "minshuku-saas",
      },
    });

    if (!response.ok) {
      throw new Error(`GITHUB_API_ERROR: ${response.status} ${response.statusText}`);
    }

    const user: GitHubUser = await response.json();

    // 2️⃣ If email is null, fetch it from the emails endpoint
    let email = user.email;
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "minshuku-saas",
        },
      });

      if (emailResponse.ok) {
        const emails: { email: string; primary: boolean; verified: boolean }[] =
          await emailResponse.json();
        const primary = emails.find((e) => e.primary);
        email = primary?.email ?? emails[0]?.email ?? null;
      }
    }

    // 3️⃣ Map to unified OAuthProfile
    return {
      provider: "github",
      providerId: String(user.id),
      email: email ?? undefined,
      emailVerified: true,
      name: user.name ?? user.login,
      avatar: user.avatar_url,
      sub: String(user.id),
    };
  }
}
