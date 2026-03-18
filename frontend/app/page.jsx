"use client";

import { useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { OAUTH_LOGIN } from "@/graphql/oauthLogin";

export default function Home() {
  const [oauthLogin] = useMutation(OAUTH_LOGIN);

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: "800076508226-tcnsucgav56pet5jqj7uevrivkga7m3r.apps.googleusercontent.com",
      auto_select: false,
      cancel_on_tap_outside: true,
      prompt: "consent  select_account",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      { theme: "outline", size: "large" }
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

      alert("登录成功！");
    } catch (err) {
      console.error(err);
      alert("登录失败");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h1>Minimal Auth Test</h1>
      <div id="googleButton"></div>
    </div>
  );
}