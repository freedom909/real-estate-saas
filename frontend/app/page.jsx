"use client";
console.log("GOOGLE_CLIENT_ID =", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { OAUTH_LOGIN } from "@/graphql/oauthLogin";
import { CHAT } from "@/graphql/chat";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID environment variable not set");
}
export default function Home() {
  const [oauthLogin] = useMutation(OAUTH_LOGIN);
  const [chat, { data: chatData, loading: chatLoading, error: chatError }] =
    useMutation(CHAT);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: "",
      auto_select: false,
      cancel_on_tap_outside: true,
      prompt: "consent  select_account",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      { theme: "outline", size: "medium" }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const googleIdToken = response.credential;

      const { data } = await oauthLogin({
        variables: {
          provider: "GOOGLE",
          idToken: googleIdToken,
        },
      });

      localStorage.setItem("accessToken", data.oauthLogin.accessToken);
      console.log("accessToken:", data.oauthLogin.accessToken);
      alert("登录成功！");
    } catch (err) {
      console.error(err);
      alert("登录失败");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await chat({ variables: { message: searchQuery } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const chatResult = chatData?.chat;

  return (
    <div style={{ padding: 50 }}>
      <h1>Minimal Auth Test</h1>
      <div id="googleButton"></div>

      <div style={{ marginTop: 40 }}>
        <h2>Wisdom Search</h2>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search listings, bookings..."
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 16,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
          <button
            onClick={handleSearch}
            disabled={chatLoading || !searchQuery.trim()}
            style={{
              padding: "8px 20px",
              fontSize: 16,
              cursor: chatLoading || !searchQuery.trim() ? "not-allowed" : "pointer",
              borderRadius: 4,
              border: "1px solid #333",
              background: "#333",
              color: "#fff",
            }}
          >
            {chatLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {chatError && (
          <p style={{ color: "red", marginTop: 12 }}>
            Error: {chatError.message}
          </p>
        )}

        {chatResult && (
          <div style={{ marginTop: 20 }}>
            <p>{chatResult.summary}</p>
            {chatResult.artifacts?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {chatResult.artifacts.map((artifact, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      marginTop: 8,
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    }}
                  >
                    <strong>{artifact.type}</strong>
                    <pre style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                      {typeof artifact.content === "string"
                        ? artifact.content
                        : JSON.stringify(artifact.content, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
