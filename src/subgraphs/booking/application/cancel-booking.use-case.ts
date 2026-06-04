// src/ai-platform/domain/use-cases/cancel-booking.use-case.ts

import { inject, injectable } from "tsyringe";

import { Intent } from "@/ai-platform/domain/semantic/types/semantic-result.type";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";     
import { SemanticContext } from "@/ai-platform/domain/semantic/semantic-context";
import { CancelBookingRepository } from "../infrastructure/repos/cancelBookingRepository";
import { BookingRepository } from "../infrastructure/repos/bookingRepository";


@injectable()
export class CancelBookingUseCase {
    constructor(
    @inject(TOKENS_AI.repos.cancelBookingRepository)
    private cancelBookingRepository: CancelBookingRepository,
    
    @inject(TOKENS_AI.repos.bookingRepository)
    private bookingRepository: BookingRepository,
    ){}
  
  async execute(
    semantic: SemanticContext
  ) {

    const bookingId =
      semantic.entities.find(
        e => e.type === "booking_id"
      )?.value;

    if (!bookingId) {
      throw new Error(
        "booking id required"
      );
    }

    return this.bookingRepository.cancel(
      bookingId
    );
  }

}