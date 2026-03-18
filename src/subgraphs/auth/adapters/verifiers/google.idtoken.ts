// src/subgraphs/auth/oauth/verifiers/google.idtoken.ts

import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';

interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

interface OAuthProfile {
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

// SigningKeyCallback の型定義
type SigningKeyCallback = (err: Error | null, key?: string | Buffer) => void;

const jwks: JwksClient = jwksClient({
  jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
});

function getKey(header: jwt.JwtHeader, callback: SigningKeyCallback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    if (!key) return callback(new Error('Invalid key'));
    callback(null, key.getPublicKey());
  });
}

export default async function verifyGoogleIdToken(idToken: string): Promise<OAuthProfile> {
  try {
    const verifyOptions: VerifyOptions = {
      audience: process.env.GOOGLE_CLIENT_ID,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    };

    const payload: any = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getKey,
        verifyOptions,
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    return {
      provider: 'GOOGLE',
      providerUserId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };
  } catch (err) {
    throw new Error('INVALID_GOOGLE_ID_TOKEN');
  }
}