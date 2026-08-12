// app/lib/apolloClient.ts

import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";

import { SetContextLink } from "@apollo/client/link/context";

import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

const uploadLink = new UploadHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    "http://localhost:4000/graphql",

  headers: {
    "apollo-require-preflight": "true",
  },
});

const authLink = new SetContextLink((prevContext) => {
  let accessToken: string | null = null;

  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("auth-storage");

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);

        accessToken = parsed?.state?.accessToken ?? null;
      } catch (error) {
        console.error(
          "Failed to parse auth-storage:",
          error
        );
      }
    }
  }

  return {
    headers: {
      ...prevContext.headers,

      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(uploadLink),

  cache: new InMemoryCache(),
});