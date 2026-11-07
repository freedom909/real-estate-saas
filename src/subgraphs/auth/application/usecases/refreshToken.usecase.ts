// src/subgraphs/auth/application/usecases/refreshToken.usecase.ts

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { inject } from "tsyringe";
import { SessionService } from "../../infrastructure/services/session.service";

export class RefreshTokenUseCase {

  constructor(
    @inject(TOKENS_AUTH.services.sessionService)
    private sessionService: SessionService
  ) {}
  
  execute(cmd: { refreshToken: string; userId: string; }) {
    return this.sessionService.refreshToken(cmd);//?
  }

  async rotateRefreshTokenId(input: {
    sessionId: string;
    userId: string;
    oldRefreshTokenId: string;
    newRefreshTokenId: string;
  }): Promise<boolean> {
    return this.sessionService.rotateRefreshTokenId(input);
  }
}