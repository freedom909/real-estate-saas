// src/wisdom-web/app/components/login/handleGoogle.login.ts

import { oauthLogin } from "app/services/auth.service";

export const handleGoogleLogin = async () => {
    console.log("Google Login");

    // TODO:
    // 1. 调用 Google Identity Services
    const google = window.google;
    const auth2 = google.auth2;
    const user = await auth2.signInWithPopup({
        prompt: "select_account",
    });
    // 2. 获取 idToken
    const idToken = await user.getIdToken();
    // 3. 调用 oauthLogin(provider, idToken)
    const oauthLoginResult = await oauthLogin("google", idToken);
    console.log(oauthLoginResult);
};