// src/wisdom-web/app/auth/auth.provider.tsx

"use client";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/apolloClient";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function SyncAuthFromCookies() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const existingToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // Only sync if store is empty (e.g. after GitHub/Facebook OAuth redirect)
    if (existingToken) return;

    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");
    const userName = getCookie("userName");
    const userEmail = getCookie("userEmail");
    const userPicture = getCookie("userPicture");

    if (accessToken && refreshToken) {
      // Decode JWT to get the real user ID (sub claim)
      let userId = "";
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userId = payload.sub || "";
      } catch {
        // If JWT decode fails, try to get user info from the API
      }

      setAuth({
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email: userEmail || "",
          name: userName || "",
          picture: userPicture || "",
        },
      });

      // Clear the cookies after syncing
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";
      document.cookie = "userName=; path=/; max-age=0";
      document.cookie = "userEmail=; path=/; max-age=0";
      document.cookie = "userPicture=; path=/; max-age=0";
    }
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <SyncAuthFromCookies />
      {children}
    </ApolloProvider>
  );
}
