// src/infrastructure/auth/JWTMiddleware.ts

import { Request, Response, NextFunction } from "express";
import getUserFromToken from "@/infrastructure/auth/getUserFromToken";

export async function JWTMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth) {
    return next();
  }

  try {
    const token = auth.replace("Bearer ", "");

    const user = await getUserFromToken(token);

    (req as any).user = user;
  } catch (err) {
    console.error("JWT verify failed");

    (req as any).user = null;
  }

  next();
}