// src/modules/container/calendar.register.ts

import { container } from "tsyringe";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";

import { CalendarRepository } from "@/core/calendar/infrastructure/persistence/calendar.repository";
import { ReserveSlotUseCase } from "@/core/calendar/application/usecases/reserve-slot.usecase";
import { ReleaseSlotUseCase } from "@/core/calendar/application/usecases/release-slot.usecase";
import { GetAvailabilityUseCase } from "@/core/calendar/application/usecases/get-availability.usecase";
import { BlockDatesUseCase } from "@/core/calendar/application/usecases/block-dates.usecase";
import { CalendarAvailabilityService } from "@/core/calendar/domain/service/availability.service";

export default function registerCalendarDependencies() {
  // ── Repository ──
  container.register(TOKENS_CALENDAR.repos.calendarRepository, {
    useClass: CalendarRepository,
  });

  // ── Domain Services ──
  container.register(TOKENS_CALENDAR.service.availabilityService, {
    useClass: CalendarAvailabilityService,
  });

  // ── Use Cases ──
  container.register(TOKENS_CALENDAR.usecase.reserveSlotUseCase, {
    useClass: ReserveSlotUseCase,
  });

  container.register(TOKENS_CALENDAR.usecase.releaseSlotUseCase, {
    useClass: ReleaseSlotUseCase,
  });

  container.register(TOKENS_CALENDAR.usecase.getAvailabilityUseCase, {
    useClass: GetAvailabilityUseCase,
  });

  container.register(TOKENS_CALENDAR.usecase.blockDatesUseCase, {
    useClass: BlockDatesUseCase,
  });

  console.info("✅ Calendar dependencies registered");
}
