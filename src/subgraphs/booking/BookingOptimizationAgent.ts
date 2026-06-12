// src/subgraphs/ai/application/agents/booking/BookingOptimizationAgent.ts

import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { BookingOptimizationTool } from "./infrastructure/tools/bookingOptimization.tool";
import { BookingAIContext } from "./domain/entities/contexts/bookingAI.context";

@injectable()
export class BookingOptimizationAgent {
  constructor(
    @inject(TOKENS_AI.tool.bookingOptimizationTool)
    private bookingOptimizationTool: BookingOptimizationTool,
  ) {}


  async execute(context: BookingAIContext) {
    return this.bookingOptimizationTool.execute(context);
  }
}