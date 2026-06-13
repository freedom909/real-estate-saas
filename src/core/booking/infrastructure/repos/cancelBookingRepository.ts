// src/subgraphs/booking/infrastructure/repositories/cancelBookingRepository.ts

import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

import { BookingRepository } from "./bookingRepository";

@injectable()
export class CancelBookingRepository implements CancelBookingRepository {
    constructor(
        @inject(TOKENS_AI.repos.bookingRepository)
        private bookingRepository: BookingRepository,
    ) {}    
    
    async cancel(bookingId: string) {
        return this.bookingRepository.cancel(bookingId);
    }
}
