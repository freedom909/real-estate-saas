// src/wisdom-web/app/components/login/handleGitHub.login.ts

export const handleGitHubLogin = () => {
  console.log("GitHub Login clicked");

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback/github`;

  console.log("GitHub clientId:", clientId ? `${clientId.substring(0, 6)}...` : "MISSING");
  console.log("GitHub redirectUri:", redirectUri);

  if (!clientId) {
    console.error("GITHUB_CLIENT_ID is not configured. Check NEXT_PUBLIC_GITHUB_CLIENT_ID in .env.local");
    alert("GitHub login is not configured. Please check environment variables.");
    return;
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;

  console.log("Redirecting to GitHub:", githubAuthUrl);
  window.location.href = githubAuthUrl;
};
