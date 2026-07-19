import jwt from "jsonwebtoken";

/**
 * Extract and verify the user from the Authorization header.
 * Returns null for unauthenticated requests or invalid tokens.
 */
async function getUserFromContext(req: any) {
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
