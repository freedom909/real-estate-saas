// memory/memory.register.ts

import { container } from "tsyringe";
import { TOKENS_MEMORY } from "./memory.token";
import { BookingStateUpdater } from "@/ai-platform/memory/booking-state.updater";

export function registerMemory() {

container.register(TOKENS_MEMORY.bookingStateUpdater, {
    useClass: BookingStateUpdater,
});
}