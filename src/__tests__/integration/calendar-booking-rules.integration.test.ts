/**
 * Integration tests for booking rules against a REAL SQLite database
 * (real CalendarRepository + real Reserve/Release use cases).
 *
 * Covers the 3 business scenarios:
 *  1. Re-booking the same listing with overlapping dates must FAIL
 *  2. Two clients booking the same dates concurrently — only ONE succeeds
 *  3. Slot reserved but booking save fails → calendar dates must be RELEASED
 *
 * Run: npx jest src/__tests__/integration/calendar-booking-rules.integration.test.ts --no-cache
 */

process.env.TZ = "UTC";

import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest } from "@jest/globals";
import { Sequelize } from "sequelize";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// ── Mocks (same pattern as booking-flow.integration.test.ts) ─────────────────
jest.mock("@/modules/tokens/booking.tokens", () => ({
  TOKENS_BOOKING: {
    repository: { bookingRepository: Symbol("BookingRepository") },
    gateway: { listingGateway: Symbol("ListingGateway") },
    acl: { calendarClient: Symbol("CalendarClient") },
  },
}));

jest.mock("@/modules/tokens/event.bus.token", () => ({
  TOKENS_EVENT_BUS: { eventBus: Symbol("EventBus") },
}));

jest.mock("@/shared/eventbus/in-memory-event-bus", () => ({
  InMemoryEventBus: class {},
}));

// ── Real code under test ─────────────────────────────────────────────────────
import { initCalendarSlotModel, CalendarSlotModel } from "@/core/calendar/infrastructure/models/calendar-slot.model";
import { CalendarRepository } from "@/core/calendar/infrastructure/persistence/calendar.repository";
import { ReserveSlotUseCase } from "@/core/calendar/application/usecases/reserve-slot.usecase";
import { ReleaseSlotUseCase } from "@/core/calendar/application/usecases/release-slot.usecase";
import { SlotStatus } from "@/core/calendar/domain/value-objects/slot-status";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";

// ── Test DB setup (SQLite in-memory, single connection) ──────────────────────
let sequelize: Sequelize;
let dbFile: string;
let repo: CalendarRepository;
let reserveUseCase: ReserveSlotUseCase;
let releaseUseCase: ReleaseSlotUseCase;

beforeAll(async () => {
  // File-based SQLite: an in-memory DB shares ONE connection across the pool,
  // which corrupts concurrent transactions ("cannot commit - no transaction is
  // active"). A file DB with a single pooled connection serializes cleanly.
  dbFile = path.join(os.tmpdir(), `calendar-rules-test-${Date.now()}-${process.pid}.sqlite`);
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbFile,
    logging: false,
    pool: { max: 1, min: 0, idle: 10000 },
  });
  initCalendarSlotModel(sequelize);
  await sequelize.sync({ force: true }); // creates calendar_slots + unique index uq_calendar_listing_date
  repo = new CalendarRepository();
  reserveUseCase = new ReserveSlotUseCase(repo);
  releaseUseCase = new ReleaseSlotUseCase(repo);
});

afterAll(async () => {
  await sequelize.close();
  try {
    fs.unlinkSync(dbFile);
  } catch {
    // ignore cleanup errors
  }
});

beforeEach(async () => {
  await CalendarSlotModel.destroy({ where: {}, truncate: true });
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const LISTING = "listing-1";

function makeCalendarClient() {
  // Real calendar behavior (same as production CalendarClient → calendar subgraph),
  // minus the HTTP hop: delegates to the real Reserve/Release use cases over SQLite.
  return {
    reserveSlot: jest.fn(async (input: { listingId: string; bookingId: string; checkIn: string; checkOut: string }) => {
      return reserveUseCase.execute(input);
    }),
    releaseSlot: jest.fn(async (input: { bookingId: string; reason?: string }) => {
      return releaseUseCase.execute(input);
    }),
  };
}

function makeBookingUseCase(opts?: { failSave?: boolean }) {
  const savedBookings: any[] = [];
  const repoMock = {
    save: jest.fn(async (b: any) => {
      if (opts?.failSave) throw new Error("DB save failed");
      savedBookings.push(b);
    }),
  };
  const eventBus = { publish: jest.fn(async () => undefined) };

  const calendarClient = makeCalendarClient();
  
  const listingGateway = {
    getBookableListing: jest.fn<
      (listingId: string) => Promise<{
        id: string;
        tenantId: string;
        nightlyPrice: number;
        isBookable: boolean;
      } | null>
    >().mockImplementation(async (listingId) => {
      if (listingId !== LISTING) {
        return null;
      }

      return {
        id: LISTING,
        tenantId: "tenant-1",
        nightlyPrice: 5000,
        isBookable: true,
      };
    }),
  };

  const useCase = new CreateBookingUseCase(
    repoMock as any,
    eventBus as any,
    listingGateway as any,
    calendarClient as any
  );
  return { useCase, repoMock, eventBus, calendarClient, savedBookings };
}

async function slotsFor(checkIn: string, checkOut: string) {
  return repo.findSlots(LISTING, new Date(checkIn), new Date(checkOut));
}

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 1: Re-booking the same listing with overlapping dates must FAIL
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 1: overlapping re-booking fails", () => {
  it("second reservation with overlapping dates is rejected (check-then-act guard)", async () => {
    const first = await reserveUseCase.execute({
      listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13",
    });
    expect(first.reserved).toBe(3); // nights 10, 11, 12

    await expect(
      reserveUseCase.execute({
        listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-12", checkOut: "2026-07-15",
      })
    ).rejects.toThrow(/Some dates are unavailable/);

    // Original reservation untouched, no orphan rows from the failed attempt
    const slots = await repo.findAllByListing(LISTING);
    expect(slots).toHaveLength(3);
    expect(slots.every((s) => s.status === SlotStatus.RESERVED && s.bookingId === "booking-A")).toBe(true);
  });

  it("exact same dates are rejected too", async () => {
    await reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" });
    await expect(
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-10", checkOut: "2026-07-13" })
    ).rejects.toThrow(/Some dates are unavailable/);
  });

  it("partially overlapping range (starts inside) is rejected", async () => {
    await reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" });
    await expect(
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-11", checkOut: "2026-07-12" })
    ).rejects.toThrow(/Some dates are unavailable/);
  });

  it("adjacent dates (new check-in on previous check-out day) are ALLOWED", async () => {
    await reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" });
    const adjacent = await reserveUseCase.execute({
      listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-13", checkOut: "2026-07-15",
    });
    expect(adjacent.reserved).toBe(2); // nights 13, 14
  });

  it("blocked-by-host dates cannot be reserved", async () => {
    // Host blocks the date through a BLOCKED slot row
    const { CalendarSlot } = await import("@/core/calendar/domain/entities/calendar-slot");
    await repo.saveAll([
      CalendarSlot.create({ id: "slot-blocked", listingId: LISTING, date: new Date("2026-07-11"), status: SlotStatus.BLOCKED, blockedBy: "host-1" }),
    ]);
    await expect(
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-12" })
    ).rejects.toThrow(/Some dates are unavailable/);
  });

  it("end-to-end (CreateBookingUseCase): overlapping second booking fails and saves nothing", async () => {
    const a = makeBookingUseCase();
    const b = makeBookingUseCase();

    const bookingA = await a.useCase.execute(
      { listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any,
      { customerId: "guest-1" }
    );
    expect(bookingA).toBeTruthy();

    await expect(
      b.useCase.execute(
        { listingId: LISTING, checkInDate: "2026-07-12", checkOutDate: "2026-07-15" } as any,
        { customerId: "guest-2" }
      )
    ).rejects.toThrow(/Some dates are unavailable/);

    // Only booking A exists; failed attempt saved nothing and left no slots
    expect(b.savedBookings).toHaveLength(0);
    const slots = await repo.findAllByListing(LISTING);
    expect(slots).toHaveLength(3);
    expect(slots.every((s) => s.bookingId === bookingA.id)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 2: Two clients booking the same dates concurrently — only ONE wins
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 2: concurrent double-booking — exactly one succeeds", () => {
  it("DB unique index (listingId+date) rejects the second insert when the conflict check is raced", async () => {
    // Simulate the check-then-act race window: BOTH requests pass findConflicts
    // before either inserts. The unique index uq_calendar_listing_date must
    // still prevent the double booking.
    jest.spyOn(repo, "findConflicts").mockResolvedValue([]);

    const attempts = await Promise.allSettled([
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" }),
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-10", checkOut: "2026-07-13" }),
    ]);

    const fulfilled = attempts.filter((a) => a.status === "fulfilled");
    const rejected = attempts.filter((a) => a.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    // Exactly one set of slots exists, owned by the winner
    const slots = await repo.findAllByListing(LISTING);
    expect(slots).toHaveLength(3);
    const winnerBookingIds = new Set(slots.map((s) => s.bookingId));
    expect(winnerBookingIds.size).toBe(1);

    jest.restoreAllMocks();
  });

  it("concurrent reservations for the same dates (normal path): only one succeeds", async () => {
    const attempts = await Promise.allSettled([
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" }),
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-10", checkOut: "2026-07-13" }),
    ]);
    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter((a) => a.status === "rejected")).toHaveLength(1);

    const slots = await repo.findAllByListing(LISTING);
    expect(slots).toHaveLength(3);
  });

  it("concurrent partially-overlapping ranges: no double-booked night", async () => {
    const attempts = await Promise.allSettled([
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" }),
      reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-B", checkIn: "2026-07-12", checkOut: "2026-07-15" }),
    ]);
    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter((a) => a.status === "rejected")).toHaveLength(1);

    // No night is reserved twice — every date has at most one row
    const slots = await repo.findAllByListing(LISTING);
    const dates = slots.map((s) => s.date.toISOString().slice(0, 10));
    expect(new Set(dates).size).toBe(dates.length);
  });

  it("end-to-end (CreateBookingUseCase): two guests race for the same dates — one booking wins", async () => {
    const a = makeBookingUseCase();
    const b = makeBookingUseCase();

    const attempts = await Promise.allSettled([
      a.useCase.execute({ listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any, { customerId: "guest-1" }),
      b.useCase.execute({ listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any, { customerId: "guest-2" }),
    ]);

    const fulfilled = attempts.filter((a) => a.status === "fulfilled") as PromiseFulfilledResult<any>[];
    const rejected = attempts.filter((a) => a.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    // Exactly one booking was saved
    const savedCount = a.savedBookings.length + b.savedBookings.length;
    expect(savedCount).toBe(1);

    // All 3 slots belong to the winning booking
    const winnerId = fulfilled[0].value.id;
    const slots = await repo.findAllByListing(LISTING);
    expect(slots).toHaveLength(3);
    expect(slots.every((s) => s.bookingId === winnerId && s.status === SlotStatus.RESERVED)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Scenario 3: Slot reserved but booking save fails → calendar dates RELEASED
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 3: booking save failure releases the calendar", () => {
  it("reserved slots go back to AVAILABLE when the booking cannot be saved", async () => {
    const { useCase, calendarClient } = makeBookingUseCase({ failSave: true });

    await expect(
      useCase.execute({ listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any, { customerId: "guest-1" })
    ).rejects.toThrow("DB save failed");

    // Compensation ran: releaseSlot was called for the generated bookingId
    expect(calendarClient.releaseSlot).toHaveBeenCalledTimes(1);

    // The dates are free again: slots exist but are AVAILABLE and unowned
    const slots = await slotsFor("2026-07-10", "2026-07-13");
    expect(slots).toHaveLength(3);
    expect(slots.every((s) => s.status === SlotStatus.AVAILABLE && s.bookingId === undefined)).toBe(true);
  });

  it("released dates can be booked by another guest immediately", async () => {
    const failed = makeBookingUseCase({ failSave: true });
    await expect(
      failed.useCase.execute({ listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any, { customerId: "guest-1" })
    ).rejects.toThrow("DB save failed");

    const retry = makeBookingUseCase();
    const booking = await retry.useCase.execute(
      { listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any,
      { customerId: "guest-2" }
    );
    expect(booking).toBeTruthy();

    const slots = await slotsFor("2026-07-10", "2026-07-13");
    expect(slots.every((s) => s.status === SlotStatus.RESERVED && s.bookingId === booking.id)).toBe(true);
  });

  it("event publishing failure does NOT release an already saved booking", async () => {
    const { useCase, eventBus, calendarClient } = makeBookingUseCase();
    eventBus.publish.mockRejectedValueOnce(new Error("event bus down"));

    const booking = await useCase.execute(
      { listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any,
      { customerId: "guest-1" }
    );
    expect(booking).toBeTruthy();
    expect(calendarClient.releaseSlot).not.toHaveBeenCalled();

    const slots = await slotsFor("2026-07-10", "2026-07-13");
    expect(slots.every((s) => s.status === SlotStatus.RESERVED && s.bookingId === booking.id)).toBe(true);
  });

  it("if releaseSlot itself fails, the original save error still surfaces", async () => {
    const { useCase, calendarClient } = makeBookingUseCase({ failSave: true });
    calendarClient.releaseSlot.mockRejectedValueOnce(new Error("release exploded"));

    await expect(
      useCase.execute({ listingId: LISTING, checkInDate: "2026-07-10", checkOutDate: "2026-07-13" } as any, { customerId: "guest-1" })
    ).rejects.toThrow("DB save failed");
  });

  it("nothing to release when reservation itself failed (no releaseSlot call)", async () => {
    await reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" });

    const { useCase, calendarClient, repoMock } = makeBookingUseCase();
    await expect(
      useCase.execute({ listingId: LISTING, checkInDate: "2026-07-11", checkOutDate: "2026-07-12" } as any, { customerId: "guest-2" })
    ).rejects.toThrow(/Some dates are unavailable/);

    expect(calendarClient.releaseSlot).not.toHaveBeenCalled();
    expect(repoMock.save).not.toHaveBeenCalled();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Release mechanics (Scenario 3 support): ReleaseSlotUseCase updates existing rows
// ═════════════════════════════════════════════════════════════════════════════
describe("ReleaseSlotUseCase persistence", () => {
  it("releasing an existing reservation updates rows back to AVAILABLE (not a re-insert)", async () => {
    await reserveUseCase.execute({ listingId: LISTING, bookingId: "booking-A", checkIn: "2026-07-10", checkOut: "2026-07-13" });

    const result = await releaseUseCase.execute({ bookingId: "booking-A", reason: "test" });
    expect(result.released).toBe(3);

    const slots = await slotsFor("2026-07-10", "2026-07-13");
    expect(slots).toHaveLength(3); // rows still exist (updated, not duplicated)
    expect(slots.every((s) => s.status === SlotStatus.AVAILABLE && s.bookingId === undefined)).toBe(true);
  });

  it("release is idempotent for unknown bookings", async () => {
    const result = await releaseUseCase.execute({ bookingId: "ghost-booking" });
    expect(result.released).toBe(0);
  });
});
