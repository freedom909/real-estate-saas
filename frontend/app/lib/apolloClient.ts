// src/wisdom-web/app/lib/apolloClient.ts

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "../store/auth.store";
import { refreshToken } from "../services/auth.service";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = new SetContextLink((operation) => {
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error link — auto-refresh on token expiration
let isRefreshing = false;

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  const authError = graphQLErrors.find(
    (e) =>
      e.message?.includes("UNAUTHORIZED") ||
      e.message?.includes("TOKEN_EXPIRED") ||
      e.message?.includes("Invalid or expired token") ||
      e.message?.includes("jwt expired")
  );

  if (authError && !isRefreshing) {
    isRefreshing = true;

    return new Observable((observer) => {
      refreshToken()
        .then((success) => {
          if (success) {
            const newToken = useAuthStore.getState().accessToken;
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: `Bearer ${newToken}`,
              },
            });

            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          } else {
            observer.next({ errors: graphQLErrors } as any);
            observer.complete();
          }
        })
        .catch(() => {
          observer.next({ errors: graphQLErrors } as any);
          observer.complete();
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
});

import { Observable } from "@apollo/client/core";

export const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});
