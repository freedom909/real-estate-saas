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

// Same-origin upload proxy for file uploads (gateway doesn't forward multipart).
// The proxy (app/api/graphql-upload/route.ts) relays to the listing subgraph and
// attaches the internal x-service-token server-side — subgraphs reject direct
// browser calls with 403 (verifyInternalServiceRequest).
const UPLOAD_PROXY_URL = "/api/graphql-upload";

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
console.log("[AUTH LINK]", {
  hasAccessToken: Boolean(accessToken),
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

// Separate upload client for mutations that carry file uploads.
// Apollo Gateway doesn't forward multipart file uploads to subgraphs, so these
// requests go through the same-origin upload proxy, which relays them to the
// listing subgraph with the internal service token attached server-side.
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
    new UploadHttpLink({ uri: UPLOAD_PROXY_URL })
  ),
  cache: new InMemoryCache(),
});
