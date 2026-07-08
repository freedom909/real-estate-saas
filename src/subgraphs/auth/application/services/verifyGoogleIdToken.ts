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
  console.log(
 "VERIFY GOOGLE CLIENT ID:",
 process.env.GOOGLE_CLIENT_ID
);


console.log(
 "TOKEN AUD:",
 JSON.parse(
 Buffer.from(
 idToken.split(".")[1],
 "base64"
 ).toString()
 ).aud
);


// const ticket = await client.verifyIdToken({
//     id_token:idToken,
//     audience:
//        process.env.GOOGLE_CLIENT_ID
//  });
const ticket =
 await client.verifyIdToken({
    idToken:idToken,
    audience:
       process.env.GOOGLE_CLIENT_ID
 });
 // console.log("ticket:", ticket) //should be print here? no record output
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