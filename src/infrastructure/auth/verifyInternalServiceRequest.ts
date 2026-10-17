//src/infrastructure/auth/verifyInternalServiceRequest.ts


import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function verifyInternalServiceRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  const providedToken = req.get("x-service-token");

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
