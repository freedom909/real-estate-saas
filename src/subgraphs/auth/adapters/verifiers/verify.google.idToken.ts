// src/subgraphs/auth/services/oauth/verifiers/google.id.ts
import { OAuth2Client, TokenPayload } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
console.log(typeof client.verifyIdToken);

interface GoogleIdTokenPayload {
  provider: string;
  sub: string;
  email?: string | null;
  emailVerified?: boolean;
  name?: string | null;
  picture?: string | null;
}

export default async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleIdTokenPayload> {
  if (!idToken) {
    throw new Error("GOOGLE_ID_TOKEN_REQUIRED");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }

  return {
    provider: "GOOGLE",
    sub: payload.sub,                  // ✅ 唯一标识
    email: payload.email || null,
    emailVerified: payload.email_verified || false,
    name: payload.name || null,
    picture: payload.picture || null,
  };
}