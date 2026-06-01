import { inject, injectable } from "tsyringe";
import { BookingFraudTool } from "../../tools/booking/BookingFraudTool";
import { BookingAIContext } from "@/subgraphs/ai/domain/entities/contexts/BookingAIContext";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

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