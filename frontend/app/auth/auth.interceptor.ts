// auth/auth.interceptor.ts
// Apollo Client link that auto-refreshes expired tokens

import { ApolloLink, Observable } from "@apollo/client/core";
import { refreshToken } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const authInterceptorLink = new ApolloLink((operation, forward) => {
  // Skip auth for login mutations
  const operationName = operation.operationName;
  if (operationName === "OAuthLogin" || operationName === "RefreshToken") {
    return forward(operation);
  }

  // Add access token to headers
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }));
  }

  return forward(operation).map((response) => {
    // Check for auth errors in the response
    const errors = response.errors;
    if (errors) {
      const authError = errors.find(
        (e: any) =>
          e.message?.includes("UNAUTHORIZED") ||
          e.message?.includes("TOKEN_EXPIRED") ||
          e.message?.includes("Invalid or expired token")
      );

      if (authError && !isRefreshing) {
        // Token expired — attempt refresh
        isRefreshing = true;

        return new Observable((observer) => {
          refreshToken()
            .then((success) => {
              if (success) {
                // Retry the original operation with new token
                const newToken = useAuthStore.getState().accessToken;
                operation.setContext({
                  headers: {
                    ...operation.getContext().headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                });

                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
              } else {
                // Refresh failed — propagate error
                observer.next(response);
                observer.complete();
              }
            })
            .catch((err) => {
              observer.next(response);
              observer.complete();
            })
            .finally(() => {
              isRefreshing = false;
              // Process pending requests
              pendingRequests.forEach((cb) => cb());
              pendingRequests = [];
            });
        });
      }
    }

    return response;
  });
});

export default authInterceptorLink;
