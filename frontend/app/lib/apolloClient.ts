// app/lib/apolloClient.ts

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

// Gateway URL for normal queries/mutations
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "http://localhost:4000/graphql";

// Direct listing subgraph URL for file uploads (gateway doesn't forward multipart)
const LISTING_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_LISTING_URL ||
  "http://localhost:4101/graphql";

const uploadLink = new UploadHttpLink({
  uri: GATEWAY_URL,
});

const authLink = new SetContextLink((prevContext) => {
  let accessToken: string | null = null;

  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("auth-storage");

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        accessToken = parsed?.state?.accessToken ?? null;
                console.log(
          "🔥 APOLLO TOKEN ROLE =",
          accessToken
            ? JSON.parse(atob(accessToken.split(".")[1])).role
            : null
        );
      } catch (error) {
        console.error("Failed to parse auth-storage:", error);
      }
    }
  }

  const headers = {
    ...prevContext.headers,
    "apollo-require-preflight": "true",
    ...(accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : {}),
  };
console.log("🔥 AUTH LINK:", {
  hasAccessToken: !!accessToken,
  role: accessToken
    ? JSON.parse(atob(accessToken.split(".")[1])).role
    : null,
});

  return {
    headers,
  };
});

const httpLink = new HttpLink({
  uri: GATEWAY_URL,
});
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
// export const client = new ApolloClient({
//   link: authLink.concat(uploadLink),
//   cache: new InMemoryCache(),
// });

// Separate upload client that hits listing subgraph directly (bypasses gateway)
// Apollo Gateway doesn't forward multipart file uploads to subgraphs,
// so we send uploads directly to the listing subgraph.
const uploadAuthLink = new SetContextLink((prevContext) => {
  let accessToken: string | null = null;

  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        accessToken = parsed?.state?.accessToken ?? null;
      } catch (error) {
        console.error("Failed to parse auth-storage:", error);
      }
    }
  }

  return {
    headers: {
      ...prevContext.headers,
      "apollo-require-preflight": "true",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    
  };
});

export const uploadClient = new ApolloClient({
  link: uploadAuthLink.concat(
    new UploadHttpLink({ uri: LISTING_SUBGRAPH_URL })
  ),
  cache: new InMemoryCache(),
});
