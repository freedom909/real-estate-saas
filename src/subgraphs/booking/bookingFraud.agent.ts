import { inject, injectable } from "tsyringe";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { BookingFraudTool } from "./infrastructure/tools/bookingFraud.tool";
import { BookingAIContext } from "./domain/entities/contexts/bookingAI.context";

@injectable()
export class BookingFraudAgent {
  constructor(
    @inject(TOKENS_AI.tool.bookingFraudTool)
    private fraudTool: BookingFraudTool
  ) {}

  async execute(context: BookingAIContext) {
    const assessment = await this.fraudTool.execute(context);

    return {
      agentName: "BookingFraudAgent",
      assessment,
      timestamp: new Date().toISOString()
    };
  }
}