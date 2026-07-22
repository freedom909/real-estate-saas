// src/auth.service.ts

import { client } from "../lib/apolloClient";
import { gql } from "@apollo/client/core";
import { OAUTH_LOGIN, REFRESH_TOKEN, LOGOUT } from "../graphql/auth/auth.mutations";
import { AuthPayload, useAuthStore } from "../store/auth.store";

// ── OAuth Login ───────────────────────────────────────────────

export async function oauthLogin(
  provider: string,
  idToken: string
): Promise<AuthPayload> {
  const { data } = await client.mutate<{ oauthLogin: AuthPayload }>({
    mutation: OAUTH_LOGIN,
    variables: { provider, idToken },
  });

  const authPayload = data!.oauthLogin;
  useAuthStore.getState().setAuth(authPayload);

  return authPayload;
}

// ── Token Refresh ─────────────────────────────────────────────

export async function refreshToken(): Promise<boolean> {
  const currentRefreshToken = useAuthStore.getState().refreshToken;

  if (!currentRefreshToken) {
    console.warn("No refresh token available");
    return false;
  }

  try {
    const { data } = await client.mutate<{
      refreshToken: { accessToken: string; refreshToken: string };
    }>({
      mutation: REFRESH_TOKEN,
      variables: { refreshToken: currentRefreshToken },
    });

    if (data?.refreshToken) {
      useAuthStore.getState().setAuth({
        accessToken: data.refreshToken.accessToken,
        refreshToken: data.refreshToken.refreshToken,
        user: useAuthStore.getState().user!,
      });
      return true;
    }

    return false;
  } catch (err) {
    console.error("Token refresh failed:", err);
    // Refresh failed — force logout
    useAuthStore.getState().logout();
    return false;
  }
}

// ── Auto-refresh interceptor ──────────────────────────────────
// Call this once on app load. It checks if the access token is
// about to expire and refreshes it proactively.

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenRefresh() {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) return;

  try {
    // Decode JWT to get expiry (without verification — just for scheduling)
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    const expiresAt = payload.exp * 1000; // Convert to ms
    const now = Date.now();
    const refreshBuffer = 5 * 60 * 1000; // Refresh 5 minutes before expiry

    const delay = expiresAt - now - refreshBuffer;

    if (delay <= 0) {
      // Token already expired or about to — refresh now
      refreshToken();
      return;
    }

    refreshTimer = setTimeout(async () => {
      const success = await refreshToken();
      if (success) {
        // Schedule next refresh
        scheduleTokenRefresh();
      }
    }, delay);

    console.log(`Token refresh scheduled in ${Math.round(delay / 1000)}s`);
  } catch (err) {
    console.error("Failed to schedule token refresh:", err);
  }
}

// ── Logout ────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  // Clear refresh timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  // Clear Apollo client cache
  await client.clearStore();

  // Clear local auth state
  useAuthStore.getState().logout();

  // Clear cookies (for the redirect flow)
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "refreshToken=; path=/; max-age=0";
  document.cookie = "userName=; path=/; max-age=0";

  // Redirect to home
  window.location.href = "/";
}

// ── Get current user ──────────────────────────────────────────

export function getCurrentUser() {
  return useAuthStore.getState().user;
}

// ── Check if authenticated ────────────────────────────────────

export function isAuthenticated(): boolean {
  const { accessToken, user } = useAuthStore.getState();
  return !!accessToken && !!user;
}
