import { SecurityEventBuilder } from "../../security/builder/securityEvent.builder";
import { GeminiSecurityService } from "../../security/service/geminiSecurity.service";
import  SecurityEventRepository  from "../../security/repos/securityEvent.repo";
import { SecurityAssessment } from "../../domain/user/types/types";
import { container } from "tsyringe";

interface Context {
  user?: any;
  ip?: string;
  userAgent?: string;
}

class SecurityChallengeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityChallengeError";
  }
}

export async function securityMiddleware(
  ctx: Context,
  { action, payload }: { action: string; payload: any }
): Promise<void> {

  // ✅ 1. build 必须返回对象
  const event = new SecurityEventBuilder()
    .withActor({ userId: ctx.user?.id ?? "anonymous" })
    .withAction(action) // ✅ 你漏了这个（很重要）
    .withResource({ type: "user", id: ctx.user?.id ?? "anonymous" })
    .withContext({ ip: ctx.ip, userAgent: ctx.userAgent })
    .withPayload(payload)
    .build(); // ✅ 必须返回 SecurityEvent

  // ✅ 2. service（建议单例，但先这样）
  const geminiService : GeminiSecurityService = container.resolve(GeminiSecurityService);

  const assessment: SecurityAssessment =
    await geminiService.analyze(event); // ✅ プロパティ 'analyze' は型 'UiStrategyService' に存在しません。

  // ✅ 3. repository
  const securityEventRepository = new SecurityEventRepository();

  if (assessment.suggestedAction === "FLAG") {
    await securityEventRepository.save(event, assessment);
  }

  if (assessment.suggestedAction === "CHALLENGE") {
    throw new SecurityChallengeError(
      assessment.reason || "Security challenge required"
    );
  }
}