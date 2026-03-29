import "reflect-metadata";
import { container } from "tsyringe";
import  register  from "./container/register";
import { TOKENS_SECURITY } from "./container/tokens";
import { EvaluateRiskUseCase } from "./application/evaluateRisk.usecase";

async function main() {
  register();

  const usecase = container.resolve<EvaluateRiskUseCase>(
    TOKENS_SECURITY.evaluateRiskUseCase
  );

  const result = await usecase.execute({
    userId: "user-1",
    userAgent: "Mozilla/5.0",
    ip: "1.1.1.1",
    deviceId: "iPhone-1234",
    failedAttempts: 6,
    isNewDevice: true,
    ipRisk: true,

  });

  console.log("🔥 Risk Result:", result);
}

main();