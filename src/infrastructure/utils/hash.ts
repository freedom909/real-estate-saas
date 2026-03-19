// shared/security/hash.ts
import crypto from "crypto";

export function hash(token: string): string {
  if (!token) return "";
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}