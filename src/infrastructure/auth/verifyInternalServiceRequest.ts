//src/infrastructure/auth/verifyInternalServiceRequest.ts

import crypto from "node:crypto";
import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function verifyInternalServiceRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  const providedToken = req.get("x-service-token");


// 临时诊断：不打印 token 明文
console.log("[InternalAuth Request Diagnostic]", {
  expectedConfigured: Boolean(expectedToken),
  expectedLength: expectedToken?.length ?? 0,
  expectedFingerprint: expectedToken
    ? crypto.createHash("sha256").update(expectedToken).digest("hex").slice(0, 16)
    : null,
  providedHeaderPresent: typeof providedToken === "string",
  providedLength: providedToken?.length ?? 0,
  providedFingerprint: providedToken
    ? crypto.createHash("sha256").update(providedToken).digest("hex").slice(0, 16)
    : null,
});
  // Fail closed when the server has not been configured.
  if (!expectedToken) {
    console.error(
      "[InternalAuth] INTERNAL_SERVICE_TOKEN is not configured",
    );
    res.status(503).json({ error: "Service authentication unavailable" });
    return;
  }

  if (!providedToken) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const expected = Buffer.from(expectedToken, "utf8");
  const provided = Buffer.from(providedToken, "utf8");

  const valid =
    expected.length === provided.length &&
    timingSafeEqual(expected, provided);

  if (!valid) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
