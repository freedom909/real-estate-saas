import { SecurityAssessment } from "@/domain/user/types/types";
import { LoginContext, StrategyResult } from "../type";

const ACTION_TO_MODE: Record<
  "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK",
  "normal" | "strict" | "verify"
> = {
  ALLOW: "normal",
  FLAG: "normal",
  CHALLENGE: "verify",
  BLOCK: "strict",
};
export class UiStrategyAdapter {
  static fromAssessment(
    assessment: SecurityAssessment,
    ctx: LoginContext
  ): StrategyResult {
    // 
    return {
      mode: ACTION_TO_MODE[assessment.suggestedAction], //名前 'aiResult' が見つかりません。
      showSecurityBanner: assessment.riskScore > 0.5,
      showOnboarding: ctx.isFirstLogin,
    };
  }
}