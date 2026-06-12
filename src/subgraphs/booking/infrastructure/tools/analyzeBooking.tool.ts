//src/subgraphs/ai/application/tools/booking/AnalyzeBookingTool.ts


import { injectable } from "tsyringe";
import { BookingAIContext } from "../../domain/entities/contexts/bookingAI.context";

@injectable()
export class AnalyzeBookingTool {
  async execute(context: BookingAIContext) {
    return "luxury apartment";
  }
}