"use client";

import { oauthLogin } from "app/services/auth.service";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google GIS Loaded");
      console.log(window.google);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          const idToken = response.credential;

          const { data } = await oauthLogin("GOOGLE", idToken);
          const result = data?.oauthLogin;

          if (result?.accessToken) {
            localStorage.setItem("accessToken", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);
            window.location.href = "/listing";
            redirect("/home");
          }
        }
      });
      initialized.current = true;
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        {
          theme: "outline",
          size: "large",
        }
      );
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      style={{
        padding: 80,
      }}
    >
      <h1>Google Login Test</h1>

      <div id="googleButton"></div>
    </div>
  );
}