// auth/authMiddleware.ts
import jwt, { JwtPayload } from "jsonwebtoken";
export default function authMiddleware({ tokenService }) {
  return function (req, res, next) {
    try {
      /* -------------------------------------------------- */
      /* 1️⃣ Service-to-service auth (KEEP THIS)             */
      /* -------------------------------------------------- */
      if (req.headers["x-service-token"]) {
        try {
const decoded = jwt.verify(
  req.headers["x-service-token"] as string,
  process.env.SERVICE_SECRET!
) as JwtPayload;

          if (decoded.type === "service") {
            req.service = decoded;
            return next();
          }
        } catch {
          return res.status(401).json({ error: "Invalid service token" });
        }
      }

      /* -------------------------------------------------- */
      /* 2️⃣ User auth via TokenService (NEW)                */
      /* -------------------------------------------------- */
      const token = tokenService.extractTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = tokenService.verifyAccessToken(token);

      // ✅ unified shape
      req.user = user; // { userId, role }

      next();
    } catch (err) {
      console.error("Auth ERROR:", err);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
