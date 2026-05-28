import crypto from "crypto";

export function fingerprint(input: {
  userAgent: string;
  ip: string;
}) {
  return crypto
    .createHash("sha256")
    .update(input.userAgent + input.ip)
    .digest("hex");
}