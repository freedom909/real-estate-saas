"use client";

import { oauthLogin } from "@/app/services/auth.service";

import { useAuthStore } from "@/app/store/auth.store";

import { useEffect, useRef } from "react";

import { handleGitHubLogin } from "@/app/components/login/handleGitHub.login";
import { handleFacebookLogin } from "@/app/components/login/handleFacebook.login";

export default function LoginPage() {

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

    const initialized = useRef(false);

    useEffect(() => {

        if (initialized.current) return;

        const script = document.createElement("script");

        script.src = "https://accounts.google.com/gsi/client"
            ;

        script.async = true;

        script.defer = true;

        script.onerror = () => {
            console.error("Failed to load Google GSI script");
        };

        script.onload = () => {

            try {
            window.google.accounts.id.initialize({

                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: any) => {

                    try {

                        const idToken = response.credential;

                        const result = await oauthLogin("GOOGLE", idToken);

                        if (!result?.accessToken) return;

                        console.log("Google login success:", result);

                        window.location.href = "/listing";

                    } catch (err) {

                        console.error("Login callback error:", err);

                    }

                },
            });

            initialized.current = true;

            window.google.accounts.id.renderButton(

                document.getElementById("googleButton"),

                {

                    theme: "outline",

                    size: "large",

                }

            );
            } catch (err) {
                console.error("Google GSI initialization failed:", err);
            }
        };

        document.body.appendChild(script);

        return () => {

            document.body.removeChild(script);

        };

    }, []);

    return (

        <div style={{ padding: 80 }}>

            <h1>Login</h1>

            <div id="googleButton" style={{ marginBottom: 16 }}></div>

            <button
                onClick={handleGitHubLogin}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 24px",
                    backgroundColor: "#24292e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: 400,
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
            </button>

            <button
                onClick={handleFacebookLogin}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 24px",
                    backgroundColor: "#1877F2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: 400,
                    marginTop: 12,
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                </svg>
                Continue with Facebook
            </button>

        </div>

    );

}