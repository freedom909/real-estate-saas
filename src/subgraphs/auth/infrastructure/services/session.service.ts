// infrastructure/services/session.service.ts

import { injectable } from "tsyringe";
import { ISessionPort } from "../../domain/ports/session.port";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SessionService implements ISessionPort {

  async createSession(input: {
    userId: string;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }) {

    const sessionId = uuidv4();

    // 👉 这里可以调用 repo 存 DB
    // await this.sessionRepo.create(...)

    const accessToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        type: "access",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        type: "refresh",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    // 👉 可以写 blacklist / DB revoke
  }
}