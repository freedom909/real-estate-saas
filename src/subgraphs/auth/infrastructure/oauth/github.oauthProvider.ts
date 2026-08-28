// src/subgraphs/auth/infrastructure/oauth/github.oauthProvider.ts
import { OAuthCredential, OAuthProfile, OAuthProvider } from "../../domain/services/oauthProvider.interface";


interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export class GitHubOAuthProvider
  implements OAuthProvider {

  async authenticate(
    credential: OAuthCredential
  ): Promise<OAuthProfile> {

    // 1. credential.code
    if (!credential.code) {
      throw new Error(
        "GitHub OAuth code is required"
      );
    }

    // 2. GitHub code → access_token
    const accessToken =
      await this.exchangeGitHubCode(
        credential.code
      );

    // 3. GitHub /user + /user/emails
    const profile =
      await this.getGitHubProfile(
        accessToken
      );

    // 4. email is required
    if (!profile.email) {
      throw new Error(
        "GitHub user email is required"
      );
    }

    // 5. Convert to unified OAuthProfile
    return {
      provider: "github",
      providerId: String(profile.user.id),
      email: profile.email,
      emailVerified: profile.emailVerified,
      name:
        profile.user.name ??
        profile.user.login,
      avatar: profile.user.avatar_url,
      sub: String(profile.user.id),
    };
  }

  private async exchangeGitHubCode(
    code: string
  ): Promise<string> {

    const params = new URLSearchParams({
      client_id:
        process.env.GITHUB_CLIENT_ID!,
      client_secret:
        process.env.GITHUB_CLIENT_SECRET!,
      redirect_uri:
        `${
          process.env.NEXTAUTH_URL ??
          "http://localhost:3000"
        }/api/auth/callback/github`,
      code,
    });

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
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

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        `GitHub token exchange failed: ${
          data.error ??
          response.statusText
        } - ${
          data.error_description ?? ""
        }`
      );
    }

    if (!data.access_token) {
      throw new Error(
        "GitHub access token is missing"
      );
    }

    return data.access_token;
  }

  private async getGitHubProfile(
    accessToken: string
  ): Promise<{
    user: GitHubUser;
    email?: string;
    emailVerified: boolean;
  }> {

    const user =
      await this.fetchGitHubUser(
        accessToken
      );

    // GitHub may already return email
    if (user.email) {
      return {
        user,
        email: user.email,
        emailVerified: true,
      };
    }

    // Otherwise query /user/emails
    const emails =
      await this.fetchGitHubEmails(
        accessToken
      );

    const primary =
      emails.find(
        (email) =>
          email.primary &&
          email.verified
      );

    const verified =
      emails.find(
        (email) => email.verified
      );

    return {
      user,
      email:
        primary?.email ??
        verified?.email ??
        emails[0]?.email,
      emailVerified:
        primary?.verified ??
        verified?.verified ??
        false,
    };
  }

  private async fetchGitHubUser(
    accessToken: string
  ): Promise<GitHubUser> {

    const response = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          Accept:
            "application/vnd.github+json",
          "User-Agent":
            "minshuku-saas",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `GITHUB_API_ERROR: ${
          response.status
        } ${
          response.statusText
        }`
      );
    }

    return response.json();
  }

  private async fetchGitHubEmails(
    accessToken: string
  ): Promise<GitHubEmail[]> {

    const response = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          Accept:
            "application/vnd.github+json",
          "User-Agent":
            "minshuku-saas",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `GITHUB_EMAIL_API_ERROR: ${
          response.status
        } ${
          response.statusText
        }`
      );
    }

    return response.json();
  }
}