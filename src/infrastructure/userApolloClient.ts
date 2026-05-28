import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import fetch from "cross-fetch";
import dotenv from "dotenv";
dotenv.config();

export function createUserApolloClient() {
  const USER_SUBGRAPH_URL =
    process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql";

  if (!USER_SUBGRAPH_URL.startsWith("http")) {
    throw new Error(
      `USER_SUBGRAPH_URL must be absolute, got: ${USER_SUBGRAPH_URL}`
    );
  }

  return new ApolloClient({
    link: new HttpLink({
      uri: USER_SUBGRAPH_URL,
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}

export const userApolloClient = createUserApolloClient();