import { GraphQLClient } from "graphql-request";

export class UserClient {
  constructor(
    private url: string,
    private serviceToken?: string
  ) {
    console.log("[UserClient] Initialized with URL:", url, "token present:", !!serviceToken);
  }

  private get client() {
    const headers: Record<string, string> = this.serviceToken
      ? { "x-service-token": this.serviceToken }
      : {};
    console.log("[UserClient] Making request to:", this.url, "headers:", headers);
    return new GraphQLClient(this.url, { headers });
  }

  // ✅ 1. findByEmail
  async findByEmail(email: string) {
    const query = `
      query ($email: String!) {
        userByEmail(email: $email) {
          id
          email
          picture
          name
        }
      }
    `;

    console.log("[UserClient] findByEmail:", email, "url:", this.url);
    try {
      const data = await this.client.request(query, { email });
      console.log("[UserClient] findByEmail result:", JSON.stringify(data));
      return data.userByEmail;
    } catch (err: any) {
      console.error("[UserClient] findByEmail error:", err.message);
      throw err;
    }
  }

  // ✅ 2. findById
  async findById(userId: string) {
    const query = `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
          name
          picture
        }
      }
    `;

    console.log("[UserClient] findById:", userId);
    try {
      const data = await this.client.request(query, { id: userId });
      console.log("[UserClient] findById result:", JSON.stringify(data));
      return data.user;
    } catch (err: any) {
      console.error("[UserClient] findById error:", err.message);
      throw err;
    }
  }

  // ✅ 3. createUserFromOAuth
  async createUserFromOAuth(profile: any) {
    const normalizeProvider = (p: string) => {
      const providerMap: Record<string, string> = {
        "https://accounts.google.com": "GOOGLE",
        "google": "GOOGLE",
        "apple": "APPLE",
        "github": "GITHUB",
        "facebook": "FACEBOOK",
        "line": "LINE",
      };
      return providerMap[p] || p.toUpperCase();
    };

    const mutation = `
      mutation ($input: CreateOAuthUserInput!) {
        createOAuthUser(input: $input) {
          id
          email
          name
          picture
        }
      }
    `;

    const variables = {
      input: {
        email: profile.email,
        provider: normalizeProvider(profile.provider),
        profile: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
        },
      },
    };

    console.log("[UserClient] createUserFromOAuth input:", JSON.stringify(variables));
    console.log("[UserClient] createUserFromOAuth url:", this.url);
    try {
      const data = await this.client.request(mutation, variables);
      console.log("[UserClient] createUserFromOAuth result:", JSON.stringify(data));
      return data.createOAuthUser;
    } catch (err: any) {
      console.error("[UserClient] createUserFromOAuth error:", err.message);
      throw err;
    }
  }
}