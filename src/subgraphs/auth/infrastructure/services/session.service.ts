// infrastructure/services/session.service.ts

import { inject, injectable } from "tsyringe";
import { ISessionPort } from "../../domain/ports/session.port";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuditLogService }
  from "@/modules/audit/application/write/services/audit-log.service";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";



@injectable()
export class SessionService implements ISessionPort {
  constructor(
    @inject(
      TOKENS_AUDIT.services.auditLog
    )
    private readonly auditLogService: AuditLogService
  ) { }
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
await this.auditLogService
  .writeAuditLog({
    action:
      "USER_LOGIN_SUCCESS",

    userId:
      input.userId,

    resourceId:
      input.userId,

    resourceType:
      "AUTH",

    status:
      "SUCCESS",

    meta: {
      deviceId:
        input.deviceId,

      ip:
        input.ip,

      userAgent:
        input.userAgent,


      provider:
        "OAUTH",
    },
  });
    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    // 👉 可以写 blacklist / DB revoke
  }
}