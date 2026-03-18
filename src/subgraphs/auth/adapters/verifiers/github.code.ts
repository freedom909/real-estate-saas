interface GithubProfile {
  id: number;
  email?: string;
  name?: string;
  login?: string;
  avatar_url?: string;
}

interface GithubTokenResponse {
  accessToken?: string;
}

interface OAuthProfile {
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

async function githubIdToken(idToken: string): Promise<OAuthProfile> {
  if (!idToken) {
    throw new Error("Missing OAuth code");
  }

  const tokenRes = await fetch(
    "https://github.com/login/oauth/accessToken",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        id_token: idToken,
      }),
    }
  );

  const tokenData: GithubTokenResponse = await tokenRes.json();

  if (!tokenData.accessToken) {
    throw new Error("Failed to obtain Github access token");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.accessToken}`,
    },
  });

  const profile: GithubProfile = await userRes.json();

  return {
    provider: "GITHUB",
    providerUserId: profile.id.toString(),
    email: profile.email,
    name: profile.name || profile.login,
    avatar: profile.avatar_url,
  };
}

export default githubIdToken;
