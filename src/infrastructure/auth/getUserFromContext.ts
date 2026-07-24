import jwt from "jsonwebtoken";
import { mapLegacyRole } from "@/core/shared/domain/role";

/**
 * Extract and verify the user from the Authorization header.
 * Returns null for unauthenticated requests or invalid tokens.
 *
 * If the gateway has already decoded the user (x-gateway-user header),
 * use that directly instead of re-decoding the JWT.
 */
async function getUserFromContext(req: any) {
  // Extract tenant ID from gateway-forwarded header
  const tenantId = req.headers["x-tenant-id"] || null;

  // Prefer pre-decoded user from gateway auth plugin
  const gatewayUser = req.headers["x-gateway-user"];
  if (gatewayUser) {
    try {
      const parsed = JSON.parse(gatewayUser);
      return {
        userId: parsed.userId,
        sessionId: parsed.sessionId,
        type: parsed.type,
        email: parsed.email,
        role: parsed.role ?? mapLegacyRole("CUSTOMER"),
        tenantId: parsed.tenantId || tenantId,
      };
    } catch {
      // Fall through to JWT decode
    }
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "");

    // Decode header to detect algorithm
    const decodedHeader = jwt.decode(token, { complete: true });
    const alg = decodedHeader?.header?.alg;

    // Use ACCESS_TOKEN_SECRET for HS256 (what SessionService signs with)
    // Use JWT_PUBLIC_KEY for RS256 (if tokens are ever signed with asymmetric keys)
    let secret: string;
    if (alg === "RS256") {
      secret = process.env.JWT_PUBLIC_KEY || process.env.ACCESS_TOKEN_SECRET!;
    } else {
      secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET!;
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: alg === "RS256" ? ["RS256"] : ["HS256"],
    }) as any;

    return {
      userId: decoded.sub,
      sessionId: decoded.sessionId,
      type: decoded.type,
      email: decoded.email,
      role: decoded.role ? mapLegacyRole(decoded.role) : undefined,
      tenantId,
    };
  } catch (err: any) {
    // Provide actionable diagnostic info
    const reason =
      err.name === "TokenExpiredError"
        ? "Token expired — please re-login"
        : err.name === "JsonWebTokenError"
          ? `Invalid signature — token was signed with a different secret. Clear localStorage and re-login. (${err.message})`
          : err.message;
    console.error(`[Auth] JWT verify failed: ${reason}`);
    return null;
  }
}

export default getUserFromContext;
