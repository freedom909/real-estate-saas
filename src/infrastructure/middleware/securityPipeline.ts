import { SecurityEventBuilder } from "@/security/builder/securityEvent.builder";
import SecurityEventRepository from "@/security/repos/securityEvent.repo";
import { GeminiSecurityService } from "@/security/service/geminiSecurity.service";
import { Context } from "vm";
import { container } from "tsyringe";

export async function securityPipeline(
  ctx: Context,
  input: { action: string; payload: any },
  next: () => Promise<any>
) {
  const event = new SecurityEventBuilder()
    .withActor({ userId: ctx.user?.id ?? "anonymous" })
    .withAction(input.action)
    .withResource({ type: "user", id: ctx.user?.id })
    .withContext({ ip: ctx.ip, userAgent: ctx.userAgent })
    .withPayload(input.payload)
    .build();

  const gemini = container.resolve(GeminiSecurityService);
  const repo = new SecurityEventRepository();

  const assessment = await gemini.analyze(event);

  // 🔥 核心：真正产生影响
  switch (assessment.suggestedAction) {
    case "ALLOW":
      return next();

    case "FLAG":
      await repo.save(event, assessment);
      return next();

    case "CHALLENGE":
      throw new Error("MFA_REQUIRED");

    case "BLOCK":
      throw new Error("ACCESS_DENIED");

    default:
      return next();
  }
}