// src/wisdom-web/app/components/login/handleFacebook.login.ts

export const handleFacebookLogin = () => {
  console.log("Facebook Login");

  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/facebook`;

  if (!clientId) {
    console.error("FACEBOOK_CLIENT_ID is not configured");
    return;
  }

  const facebookAuthUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=email,public_profile`;

  window.location.href = facebookAuthUrl;
};
