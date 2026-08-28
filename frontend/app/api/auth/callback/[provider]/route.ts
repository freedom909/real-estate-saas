// app/api/auth/callback/[provider]/route.ts
// Unified OAuth callback — handles Google, GitHub, and Facebook

import { Role } from "@/app/permission/role";
import { NextRequest, NextResponse } from "next/server";

const AUTH_GRAPHQL_ENDPOINT =
  process.env.AUTH_GRAPHQL_ENDPOINT || "http://127.0.0.1:4010/graphql";

const OAUTH_LOGIN_MUTATION = `
  mutation OAuthLogin($provider: OAuthProvider!, $credential: OAuthCredentialInput!) {
    oauthLogin(provider: $provider, credential: $credential) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        picture
        role
      }
    }
  }
`;

// ── Shared: call backend + set cookies ────────────────────────

async function authenticateWithBackend(
  provider: string,
  code: string
) {
  const authResponse =
    await fetch(AUTH_GRAPHQL_ENDPOINT, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        query:
          OAUTH_LOGIN_MUTATION,

        variables: {
          provider:
            provider.toUpperCase(),

          credential: {
            code,
          },
        },
      }),
    });

  const authData =
    await authResponse.json();

  if (authData.errors) {
    throw new Error(
      authData.errors[0]?.message ||
      "Auth failed"
    );
  }

  return authData.data.oauthLogin;
}

function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  user: {
    name?: string;
    email?: string;
    picture?: string;
    role: Role;
  }
) {
  const secure = process.env.NODE_ENV === "production";

  console.log("[cookies] NODE_ENV =", process.env.NODE_ENV);
  console.log("[cookies] secure =", secure);
  console.log("[cookies] accessToken =", !!accessToken);
  console.log("[cookies] refreshToken =", !!refreshToken);
  console.log("[cookies] user =", {
    email: user.email,
    role: user.role,
  });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userRole", user.role, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userName", user.name || "", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userEmail", user.email || "", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("userPicture", user.picture || "", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

console.log(
  "[oauth] FINAL response cookies:",
  response.cookies.getAll().map(cookie => ({
    name: cookie.name,
    path: cookie.path,
  }))
);

  return response;
}

// ── Route handler ─────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ provider: string }>;
  }
) {
  const { provider } = await params;
  provider.toUpperCase()
  const { searchParams } =
    new URL(request.url);

  const code =
    searchParams.get("code");

  const error =
    searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error)}`,
        request.url
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=no_code",
        request.url
      )
    );
  }

  try {
    // ⭐ Route 不负责 OAuth Provider
    // ⭐ Route 不 exchange code
    // ⭐ Route 不 get profile
    // ⭐ Route 只把 code 交给 Auth Backend

    const {
      accessToken,
      refreshToken,
      user,
    } = await authenticateWithBackend(
      provider,
      code
    );

    console.log(
      `[${provider}] Backend auth succeeded`
    );

    const response =
      NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );

    setAuthCookies(
      response,
      accessToken,
      refreshToken,
      user
    );

    return response;

  } catch (err: unknown) {

    const errorMsg =
      err instanceof Error
        ? err.message
        : String(err);

    console.error(
      `[${provider}] OAuth callback error:`,
      errorMsg
    );

    return NextResponse.redirect(
      new URL(
        `/login?error=auth_failed&detail=${encodeURIComponent(errorMsg)}`,
        request.url
      )
    );
  }
}
