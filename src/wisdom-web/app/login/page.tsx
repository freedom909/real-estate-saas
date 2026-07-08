"use client";

import { oauthLogin } from "app/services/auth.service";
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
    console.log("useEffect running");
    if (initialized.current) return;

    if (!window.google) return;
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

          console.log("========== CALLBACK ==========");
          console.log(response);

          const idToken = response.credential;

          console.log("Google ID TOKEN:");
          console.log(idToken);
          const { data } = await oauthLogin("GOOGLE", idToken);
          console.log(data);
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