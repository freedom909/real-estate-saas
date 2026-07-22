"use client";

import { useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const { provider } = useParams<{ provider: string }>();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      window.location.href = `/login?error=${error}`;
      return;
    }

    if (code) {
      // Forward to the unified API route
      window.location.href = `/api/auth/callback/${provider}?code=${code}`;
    } else {
      window.location.href = "/login?error=no_code";
    }
  }, [searchParams, provider]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Completing {provider} login...</p>
    </div>
  );
}
