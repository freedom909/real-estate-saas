// src/wisdom-web/app/components/login/handleGoogleRedirect.login.ts
// Google OAuth redirect-based flow (alternative to GIS popup)

export const handleGoogleRedirectLogin = () => {
  console.log("Google Redirect Login");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/google`;

  if (!clientId) {
    console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
    return;
  }

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid email profile` +
    `&access_type=offline`;

  window.location.href = googleAuthUrl;
};
