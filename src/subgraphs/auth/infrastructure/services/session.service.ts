// infrastructure/services/session.service.ts

import { injectable } from "tsyringe";
import { ISessionPort } from "../../domain/ports/session.port";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import SessionModel from "../models/session.model";

@injectable()
export class SessionService implements ISessionPort {

  async createSession(input: {
    userId: string;
    role?: string | null;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null;
  }) {

    const sessionId = uuidv4();

    const accessToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        type: "access",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1125m" }
    );

    const refreshToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        type: "refresh",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    // TODO: blacklist / DB revoke
  }

  async updateActiveTenant(sessionId: string, tenantId: string): Promise<void> {
    await SessionModel.findOneAndUpdate(
      { id: sessionId },
      { activeTenantId: tenantId },
      { upsert: false }
    );
  }

  async findSessionById(sessionId: string): Promise<{ activeTenantId?: string | null } | null> {
    return SessionModel.findOne({ id: sessionId }).lean();
  }
}
