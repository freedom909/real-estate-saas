// src/wisdom-web/app/components/login/handleGoogle.login.ts

import { oauthLogin } from "@/app/services/auth.service";

export const handleGoogleLogin = async () => {
    console.log("Google Login");

    // 1. Call Google Identity Services
    const google = (window as any).google;
    const auth2 = google?.auth2;
    if (!auth2) {
        console.error("Google auth2 not loaded");
        return;
    }
    const user = await auth2.signInWithPopup({
        prompt: "select_account",
    });
    // 2. Get idToken
    const idToken = await user.getIdToken();
    // 3. Call oauthLogin(provider, idToken)
    const oauthLoginResult = await oauthLogin("google", idToken);
    console.log(oauthLoginResult);
};
