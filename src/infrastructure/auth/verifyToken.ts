import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  sessionId: string;
  role?: string;
}

export function verifyToken(authHeader?: string) {
  if (!authHeader) {
    console.log("❌ No auth header");
    return null;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    return payload;
  } catch (err) {
    console.log("❌ JWT verify failed:", err.message);
    return null;
  }
}