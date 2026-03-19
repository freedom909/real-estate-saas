//

import { injectable, inject } from "tsyringe";
import { TokenService } from "./token.service";
import SessionService from "./session.service";
import RiskService from "./risk/login.risk.service";
import { v4 as uuidv4 } from "uuid";

@injectable()
export default class RefreshService {
  constructor(
    @inject(TokenService) private tokenService: TokenService,
    @inject("SessionService") private sessionService: SessionService,
    @inject("RiskService") private riskService: RiskService
  ) {}

  async refresh(refreshToken: string) {
    // 1. Verify Token
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const { jti, sessionId, familyId, sub: userId } = payload;

    // 2. Check Session
    const session = await this.sessionService.findBySessionId(sessionId);

    if (!session) {
      // Session expired or deleted, revoke this token
      await this.tokenService.revokeToken(jti, payload.exp!);
      throw new Error("Session invalid");
    }

    // 3. Detect Reuse (🔥 Core Rotation Logic)
    if (session.refreshTokenId !== jti) {
      // 🚨 Mismatch! This token was already used or is malicious.
      
      // Revoke the entire family
      await this.sessionService.revokeFamily(familyId);
      
      // Record Risk
      await this.riskService.record({
        type: "TOKEN_REUSE",
        userId: userId,
        ip: payload.ip || "unknown", // From token payload if available
        userAgent: payload.userAgent || "unknown",
        deviceId: payload.deviceId || "unknown",
        severity: "HIGH",
        metadata: {
          expectedJti: session.refreshTokenId,
          actualJti: jti,
          familyId,
        },
      });

      // Revoke this specific token just in case
      await this.tokenService.revokeToken(jti, payload.exp!);

      throw new Error("Refresh token reuse detected");
    }

    // 4. Rotation Success: Revoke old token
    await this.tokenService.revokeToken(jti, payload.exp!);

    // 5. Generate New Token Pair
    const newRefreshJti = uuidv4();
    
    // Carry over device info from previous payload or session
    const deviceId = payload.deviceId || session.deviceId;
    
    const newAccessToken = this.tokenService.signAccessToken({
      sub: userId,
      sessionId: sessionId,
      familyId: familyId,
      deviceId: deviceId,
      ip: payload.ip,
      userAgent: payload.userAgent,
    });

    const newRefreshToken = this.tokenService.signRefreshToken({
      sub: userId,
      sessionId: sessionId,
      familyId: familyId,
      jti: newRefreshJti,
      deviceId: deviceId,
      ip: payload.ip,
      userAgent: payload.userAgent,
    });

    // 6. Update Session with new JTI
    await this.sessionService.updateRefreshTokenId(sessionId, newRefreshJti);

    return {
      accessToken: newAccessToken.token,
      refreshToken: newRefreshToken.token,
    };
  }
}
