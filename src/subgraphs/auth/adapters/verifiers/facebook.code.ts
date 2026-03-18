interface FacebookUser {
  id: string;
  email?: string;
  name?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  error?: any;
}

interface FacebookTokenData {
  accessToken?: string;
}

interface OAuthProfile {
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string | null;
}

async function verifyFacebookCode(code: string): Promise<OAuthProfile> {
  if (!code) {
    throw new Error("Missing OAuth code");
  }

  // 1️⃣ Exchange code for accessToken
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/accessToken?` +
    new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID!,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
      code,
    })
  );
  
  const tokenData: FacebookTokenData = await tokenRes.json();
  
  if (!tokenData.accessToken) {
    throw new Error("Failed to exchange Facebook access token");
  }
  
  const accessToken = tokenData.accessToken;
  
  // 2️⃣ Get user info
  const userRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&accessToken=${accessToken}`
  );
  
  const user: FacebookUser = await userRes.json();
  
  if (!user || user.error) {
    throw new Error("Invalid Facebook access token");
  }
  
  if (!user.email) {
    throw new Error("Facebook email permission missing");
  }
  
  return {
    provider: "facebook",
    providerUserId: user.id,
    email: user.email,
    name: user.name,
    avatar: user.picture?.data?.url || null,
  };
}

export default verifyFacebookCode;