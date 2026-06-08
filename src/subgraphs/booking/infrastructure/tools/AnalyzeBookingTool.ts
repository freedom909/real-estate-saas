//src/subgraphs/ai/application/tools/booking/AnalyzeBookingTool.ts

import { BookingAIContext } from "@/subgraphs/ai/domain/entities/contexts/bookingAIContext";
import { injectable } from "tsyringe";

@injectable()
export class AnalyzeBookingTool {
  async execute(context: BookingAIContext) {
    return "luxury apartment";
  }
}