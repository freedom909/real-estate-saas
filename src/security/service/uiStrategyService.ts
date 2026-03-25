//src/subgraphs/auth/services/UiStrategyService.ts

import { inject, injectable } from "tsyringe";
import  {GeminiSecurityService } from "./geminiSecurity.service"
import { LoginContext, StrategyResult } from "../type";

type UiMode = "normal" | "strict" | "verify";
type SuggestedAction = "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK";
const ACTION_TO_MODE: Record<SuggestedAction, UiMode> = {
  ALLOW: "normal",
  FLAG: "normal",
  CHALLENGE: "verify",
  BLOCK: "strict",
};
@injectable()
export class UiStrategyService {
  constructor(
    @inject("GeminiSecurityService")
    private geminiService: GeminiSecurityService
  ) {}

  async generateStrategy(loginContext: LoginContext): Promise<StrategyResult> {
    const aiResult = await this.geminiService.analyze(loginContext);

    return {
      mode: ACTION_TO_MODE[aiResult.suggestedAction], 
      showSecurityBanner: aiResult.riskScore > 0.5,
      showOnboarding: loginContext.isFirstLogin,
    };
  }

}
export default UiStrategyService;