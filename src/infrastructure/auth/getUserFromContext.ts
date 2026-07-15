import jwt from "jsonwebtoken";

async function getUserFromContext(req: any) {
  try {

const authHeader = req.headers.authorization;

if (!authHeader?.startsWith("Bearer ")) {

return null;

}

const token = authHeader.replace("Bearer ", "");

const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

const decoded = jwt.verify(token, secret!) as any;

return {

userId: decoded.sub,

sessionId: decoded.sessionId,

type: decoded.type,

};

} catch (error) {

console.error("JWT verify failed:", error);

return null;

}
}

export default getUserFromContext;