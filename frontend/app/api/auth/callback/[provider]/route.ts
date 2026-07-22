// app/api/auth/callback/[provider]/route.ts
// Unified OAuth callback — handles Google, GitHub, and Facebook

import { NextRequest, NextResponse } from "next/server";

const AUTH_GRAPHQL_ENDPOINT =
  process.env.AUTH_GRAPHQL_ENDPOINT || "http://127.0.0.1:4010/graphql";

const OAUTH_LOGIN_MUTATION = `
  mutation OAuthLogin($provider: OAuthProvider!, $idToken: String!) {
    oauthLogin(provider: $provider, idToken: $idToken) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        picture
      }
    }
  }
`;

// ── Provider-specific token exchange ──────────────────────────

async function exchangeGithubCode(code: string): Promise<string> {
  console.log("[github] Exchanging code, client_id:", process.env.GITHUB_CLIENT_ID ? "set" : "MISSING");
  console.log("[github] client_secret:", process.env.GITHUB_CLIENT_SECRET ? "set" : "MISSING");

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  console.log("[github] Exchange response:", JSON.stringify({ error: data.error, has_token: !!data.access_token }));

  if (data.error) {
    throw new Error(`GitHub token exchange failed: ${data.error} - ${data.error_description || ""}`);
  }

  return data.access_token;
}

async function exchangeGoogleCode(code: string): Promise<string> {
  // Google OAuth2 code exchange (for redirect-based flow)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Google token exchange failed: ${data.error}`);
  }

  return data.id_token;
}

async function exchangeFacebookCode(code: string): Promise<string> {
  const res = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/callback/facebook`,
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Facebook token exchange failed: ${data.error.message}`);
  }

  return data.access_token;
}

// ── Shared: call backend + set cookies ────────────────────────

async function authenticateWithBackend(
  provider: string,
  idToken: string,
  origin: string
) {
  const authResponse = await fetch(AUTH_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: OAUTH_LOGIN_MUTATION,
      variables: { provider: provider.toUpperCase(), idToken },
    }),
  });

  const authData = await authResponse.json();

  if (authData.errors) {
    throw new Error(authData.errors[0]?.message || "Auth failed");
  }

  return authData.data.oauthLogin;
}

function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  user: { name?: string; email?: string; picture?: string }
) {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set("accessToken", accessToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userName", user.name || "", {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userEmail", user.email || "", {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userPicture", user.picture || "", {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

// ── Route handler ─────────────────────────────────────────────

const exchangeFns: Record<string, (code: string) => Promise<string>> = {
  github: exchangeGithubCode,
  google: exchangeGoogleCode,
  facebook: exchangeFacebookCode,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=no_code", request.url)
    );
  }

  const exchangeFn = exchangeFns[provider];

  if (!exchangeFn) {
    return NextResponse.redirect(
      new URL(`/login?error=unsupported_provider`, request.url)
    );
  }

  try {
    // 1️⃣ Provider-specific token exchange
    console.log(`[${provider}] Exchanging code for token...`);
    const idToken = await exchangeFn(code);
    console.log(`[${provider}] Token exchange succeeded, token length: ${idToken?.length}`);

    // 2️⃣ Authenticate with backend
    console.log(`[${provider}] Authenticating with backend...`);
    const { accessToken, refreshToken, user } = await authenticateWithBackend(
      provider,
      idToken,
      request.url
    );
    console.log(`[${provider}] Backend auth succeeded, user: ${user?.email}`);

    // 3️⃣ Set cookies and redirect
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    setAuthCookies(response, accessToken, refreshToken, user);

    return response;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`[${provider}] OAuth callback error:`, errorMsg);
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&detail=${encodeURIComponent(errorMsg)}`, request.url)
    );
  }
}
