import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";


import { UnauthorizedError } from "../../../infrastructure/utils/errors";
import Blacklist from "../../../security/blacklist/blacklist";

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import SessionRepository from "../infrastructure/repos/session.repo";
import { JwtService } from "../infrastructure/services/jwt.service";
/**
 * AuthGuard handles token verification and session validation.
 */
@injectable()
export class AuthGuard {
  constructor(
    @inject(TOKENS_AUTH.services.jwtService)
    private jwtService: JwtService,
    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository,
    @inject(TOKENS_SECURITY.services.blacklist)
    private blacklist: Blacklist
  ) { }

  /**
   * Validate access token and session
   */
  public async validate(req: Request): Promise<{ userId: string; sessionId: string }> {
    console.log("Authorization:", req.headers.authorization);
    // 1️⃣ Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    // 2️⃣ Verify access token
    // TokenServiceをDIコンテナから解決
    const payload = await this.jwtService.verify(token);
    if (payload.type !== "access") {
      throw new UnauthorizedError("Invalid token type");
    }
    if (!payload.sessionId) {
      throw new UnauthorizedError("Missing session ID");
    }
    if (payload.jti && await this.blacklist.isBlacklisted(payload.jti)) {
      throw new UnauthorizedError("Token blacklisted");
    }
    // 3️⃣ Fetch session
    const session = await this.sessionRepo.findById(payload.sessionId);
    if (!session || session.revokedAt) {
      throw new UnauthorizedError("Session invalid or revoked");
    }

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
    };
  }

  /**
   * Express middleware wrapper
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
          throw new UnauthorizedError("Missing Authorization header");
        }

        const token = authHeader.replace("Bearer ", "");
        const payload = await this.jwtService.verify(token);
        (req as any).user = {
          userId: payload.sub,
          sessionId: payload.sessionId,
          type: payload.type,
        };

        const sessionId =
    (req as any).user?.sessionId;
        next();
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          res.status(401).json({ error: err.message });
          console.error(err.message);
        } else {
          next(err);
        }
      }
    };
  }
}