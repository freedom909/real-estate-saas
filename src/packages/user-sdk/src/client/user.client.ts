import { GraphQLClient } from "graphql-request";

export class UserClient {
  constructor(private url: string) {}

  private get client() {
    return new GraphQLClient(this.url);
  }

  // ✅ 1. findByEmail
  async findByEmail(email: string) {
    const query = `
      query ($email: String!) {
        userByEmail(email: $email) {
          id
          email
        }
      }
    `;

    const data = await this.client.request(query, { email });
    return data.userByEmail;
  }

  // ✅ 2. findById
  async findById(userId: string) {
    const query = `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
        }
      }
    `;

    const data = await this.client.request(query, { id: userId });
    return data.user;
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
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: {
        email: profile.email,
        provider: normalizeProvider(profile.provider),
        profile: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
        },
      },
    });

    return data.createOAuthUser;
  }
}