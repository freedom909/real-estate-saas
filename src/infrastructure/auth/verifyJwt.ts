//src/infrastructure/auth/verifyJwt.ts
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
interface JwtPayload {
  [key: string]: any;
}

 
  const publicKeyPath = process.env.JWT_PUBLIC_KEY;

  if ( !publicKeyPath) {
    throw new Error("JWT key paths not configured");
  }

  


function verifyJwt(token: string): JwtPayload {
  return jwt.verify(
    token,
    process.env.JWT_PUBLIC_KEY!,
    {
      algorithms: ["RS256"],
      issuer: process.env.JWT_ISSUER,
    }
  ) as JwtPayload;
}

export default verifyJwt;