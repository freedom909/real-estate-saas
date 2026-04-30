// application/services/verifyGoogleIdToken.ts

import { OAuth2Client } from "google-auth-library";
interface GoogleIdTokenPayload {
  provider: string;
  sub: string;
  email?: string | null;
  emailVerified?: boolean;
  name?: string | null;
  picture?: string | null;
  iss?: string; 
}
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

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
    provider: payload.iss || "google",
    sub: payload.sub,                  // ✅ 唯一标识
    email: payload.email || null,
    emailVerified: payload.email_verified || false,
    name: payload.name || null,
    picture: payload.picture || null,
  };
}