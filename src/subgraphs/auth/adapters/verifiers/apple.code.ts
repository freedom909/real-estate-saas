// src/subgraphs/auth/services/verifiers/apple.code.ts

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export default function verifyAppleIdToken(idToken: string): Promise<AppleIdTokenPayload> {
  return verifyAppleIdToken(idToken);
}