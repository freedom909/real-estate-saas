import { GraphQLClient, gql } from "graphql-request";
import {
  FIND_BY_ID,
  FIND_USER_BY_EMAIL,
  INTERNAL_FIND_USER_BY_EMAIL,
  CREATE_OAUTH_USER
} from "./queries";
import { inject, injectable } from "tsyringe";
import { ServiceTokenService } from "../services/serviceToken.service";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";

/* =========================
   Types
========================= */

export interface User {
  id: string
  role: string
  profile?: {
    email?: string
    name?: string
    avatar?: string
  }
}

export interface CreateOAuthUserInput {
  email?: string
  provider: string
  profile?: {
    name?: string
    avatar?: string
  }
}

export interface IUserClient {

  request(query: string, variables?: any): Promise<any>

  findById(id: string): Promise<User | null>

  findByEmail(email: string): Promise<User | null>

  createOAuthUser(input: CreateOAuthUserInput): Promise<User | null>

}

/* =========================
   Implementation
========================= */
@injectable()
export default class UserClient implements IUserClient {
  client: any;
constructor(
  @inject(TOKENS_AUTH.services.serviceTokenService)
  private serviceTokenService: ServiceTokenService,
  endpoint?: string
) {

    const url =
      endpoint ||
      process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql"
    console.log("Auth Subgraph - USER_SUBGRAPH_URL env var:", process.env.USER_SUBGRAPH_URL); // New log: Check the actual env var value
    console.log("Auth Subgraph - INTERNAL_SERVICE_TOKEN in UserClient constructor:", process.env.INTERNAL_SERVICE_TOKEN); // Added log
    console.log("USER_SUBGRAPH_URL =", process.env.USER_SUBGRAPH_URL);
    console.log("GraphQL endpoint used =", url);
    this.client = new GraphQLClient(url)
    console.log("UserClient connected to:", url)
  }

  /* =========================
     Generic Request
  ========================= */

  async request(query: string, variables?: any) {
    const data = await this.client.request(query, variables)
    return data
  }

  /* =========================
     Queries
  ========================= */

  async findById(id: string): Promise<User | null> {
    console.log("id+", id)

    if (!id) return null

    const res: any = await this.client.request({
      document: FIND_BY_ID,
      variables: { id },
      requestHeaders: { Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` }
    })

    return res?.user ?? null
  }

async findByEmail(email: string): Promise<User | null> {
  console.log("findByEmail+", email);
  if (!email) return null;

  try {
    const token = process.env.INTERNAL_SERVICE_TOKEN || "";
    console.log("Auth Subgraph - Sending x-service-token (value from env):", token); // no output in the terminal
    const res: any = await this.client.request({
      document: INTERNAL_FIND_USER_BY_EMAIL,
      variables: { email },
      requestHeaders: { 
        "x-service-token": token,
      },
    });
    console.log("res++", res?.internalUserByEmail); // 🔥 注意这里也要改
    return res?.internalUserByEmail ?? null;
  } catch (err: any) {
    const gqlError = err?.response?.errors?.[0];
    console.error("findByEmail error:", gqlError || err);
    throw new Error(
      gqlError?.message || err.message || "Unknown error"
    );
  }
}

  /* =========================
     Mutations
  ========================= */

  async createOAuthUser(input: CreateOAuthUserInput) {
    try {
      console.log("createOAuthUser input:", input);
      const res: any = await this.client.request(
        CREATE_OAUTH_USER,
        { input }
      );

      console.log("createOAuthUser result:", res);

      return res?.createOAuthUser ?? null;

    } catch (err: any) {

      console.error(
        "createOAuthUser error:",
        err.response?.errors || err
      );

      throw err;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {

    const mutation = `
mutation UpdateLastLogin($userId: ID!) {
  updateLastLogin(userId: $userId)
}
`;
    await this.client.request(mutation, { userId });
  }

  /* =========================
     OAuth Provider Link
  ========================= */

  async linkOAuthProvider({
    userId,
    provider,
    providerUserId
  }: {
    userId: string
    provider: string
    providerUserId: string
  }): Promise<User | null> {

    const mutation = gql`
      mutation LinkOAuthProvider(
        $userId: ID!
        $provider: OAuthProvider!
        $providerUserId: String!
      ) {
        linkOAuthProvider(
          userId: $userId
          provider: $provider
          providerUserId: $providerUserId
        ) {
          id
          role
          profile {
            email
            name
            avatar
          }
        }
      }
    `

    const res: any = await this.client.request(mutation, {
      userId,
      provider,
      providerUserId
    })

    return res?.linkOAuthProvider ?? null
  }
}