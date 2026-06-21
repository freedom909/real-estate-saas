// src/ai-platform/domain/agents/booking/booking.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../semantic/types/IDomainAgent";

import { AgentAction, EntityType, SemanticContext } from "../../semantic/semantic-context";
import { AIContext } from "@/ai-platform/context/types/context/ai.context";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { GetBookingsForGuestUseCase } from "@/core/booking/application/usecases/getBookingsForGuest.useCase";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { ArtifactType } from "@/ai-platform/context/types/context/agent.result";

@injectable()
export class BookingAgent implements IDomainAgent {

  constructor(
    @inject(delay(() => CancelBookingUseCase))
    private cancelBookingUseCase: CancelBookingUseCase,

    @inject(delay(() => CreateBookingUseCase))
    private createBookingUseCase: CreateBookingUseCase,

    @inject(delay(() => GetBookingUseCase))
    private getBookingUseCase: GetBookingUseCase,

    @inject(delay(() => ConfirmBookingUseCase))
    private confirmBookingUseCase: ConfirmBookingUseCase,

    @inject(delay(() => CompleteBookingUseCase))
    private completeBookingUseCase: CompleteBookingUseCase,

    @inject(delay(() => GetBookingsForGuestUseCase))
    private getBookingsForGuestUseCase: GetBookingsForGuestUseCase,

    @inject(delay(() => SearchListingUseCase))
    private searchListingUseCase: SearchListingUseCase,
  ) {}

  async execute(
    semantic: SemanticContext,
    context: AIContext
  ) {

    const action = semantic.action?.type;
    const bookingId = this.extractBookingId(semantic, context);
    const listingId = this.extractListingId(semantic, context);

    switch (action) {

      case AgentAction.SEARCH_LISTING:
      case AgentAction.CHECK_AVAILABILITY: {
        return this.handleSearchOrAvailability(semantic, action);
      }

      case AgentAction.CREATE_BOOKING: {
        // ============================================
        // BOOKING-002: Resolve listingId from searchResults
        // ============================================
        // If user says "book the first one", listingId may not be in entities.
        // Resolve it from context.resources.searchResults using ordinal.
        let resolvedListingId = listingId;

        if (!resolvedListingId && context.resources?.searchResults?.length) {
          const ordinal = this.extractEntity(semantic, ["ORDINAL", "ordinal", "first", "second", "third"]);
          const index = this.parseOrdinal(ordinal);
          const match = context.resources.searchResults[index];

          if (match) {
            resolvedListingId = match.id;
            console.log(`🔗 BOOKING-002: Resolved "${ordinal}" → listingId=${resolvedListingId} (${match.title})`);
          }
        }

        if (!resolvedListingId) {
          throw new Error("Listing ID required for booking creation. Please search for listings first or provide a listing ID.");
        }

        const checkIn = this.extractEntity(semantic, ["check_in", "checkIn", "CHECK_IN", "check_in_date"]);
        const checkOut = this.extractEntity(semantic, ["check_out", "checkOut", "CHECK_OUT", "check_out_date"]);

        if (!checkIn) throw new Error("Check-in date required for booking creation.");
        if (!checkOut) throw new Error("Check-out date required for booking creation.");

        const priceEntity = semantic.entities.find(e =>
          ["PRICE", "price"].includes(e.type as string)
        );

        const booking = await this.createBookingUseCase.execute({
          listingId: resolvedListingId,
          guestId: context.identity.user.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          price: priceEntity ? Number(priceEntity.value) : 0,
          tenantId: (context.identity.user as any)?.tenantId || "tenant-dev",
        });

        return this.wrapResult(semantic, `Booking created successfully for listing ${resolvedListingId}.`, [booking]);
      }

      case AgentAction.CANCEL_BOOKING: {
        if (!bookingId) throw new Error("Booking ID required for cancellation");

        const reason = semantic.entities.find(e => (e.type as string) === "reason")?.value || "Cancelled via AI Assistant";
        const cancelled = await this.cancelBookingUseCase.execute(bookingId, reason);

        return this.wrapResult(semantic, `Booking ${bookingId} has been cancelled.`, [cancelled]);
      }

      case AgentAction.CONFIRM_BOOKING: {
        if (!bookingId) throw new Error("Booking ID required for confirmation");

        const confirmed = await this.confirmBookingUseCase.execute(bookingId);
        return this.wrapResult(semantic, `Booking ${bookingId} has been confirmed.`, [confirmed]);
      }

      case AgentAction.COMPLETE_BOOKING: {
        if (!bookingId) throw new Error("Booking ID required for completion");

        const completed = await this.completeBookingUseCase.execute(bookingId);
        return this.wrapResult(semantic, `Booking ${bookingId} has been completed.`, [completed]);
      }

      case AgentAction.GET_BOOKING: {
        if (!bookingId) throw new Error("Booking ID required to retrieve booking details.");

        const booking = await this.getBookingUseCase.execute(bookingId);
        return this.wrapResult(semantic, `Found booking ${bookingId}.`, [booking]);
      }

      case AgentAction.GET_MY_BOOKINGS: {
        const guestId = context.identity.user.id;
        const bookings = await this.getBookingsForGuestUseCase.execute(guestId);
        return this.wrapResult(semantic, `Found ${bookings.length} booking(s) for you.`, bookings);
      }

      default:
        return {
          reply: `I understand you're asking about bookings (action: ${action}), but I don't have a specific handler for that yet. I can help you with: creating, cancelling, confirming, completing, or viewing bookings.`,
          semantic,
        };
    }
  }

  // --- Helpers ---

  /**
   * BOOKING-001: Handle SEARCH_LISTING and CHECK_AVAILABILITY.
   * Extracts search params from semantic entities, calls SearchListingUseCase,
   * returns artifacts with listing results.
   */
  private async handleSearchOrAvailability(
    semantic: SemanticContext,
    action: AgentAction
  ) {
    const location = semantic.entities.find(
      e => e.type === EntityType.LOCATION
    )?.value;

    const dateRange = semantic.entities.find(
      e => e.type === EntityType.DATE_RANGE
    )?.value;

    const guestCount = semantic.entities.find(
      e => e.type === EntityType.GUEST_COUNT
    )?.value;

    const priceRange = semantic.entities.find(
      e => e.type === EntityType.PRICE_RANGE
    )?.value;

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (priceRange) {
      const parts = priceRange.split("-");
      if (parts.length === 2) {
        minPrice = Number(parts[0]);
        maxPrice = Number(parts[1]);
      }
    }

    console.log("🔍 BookingAgent SEARCH_LISTING:", { location, dateRange, guestCount, minPrice, maxPrice });

    const searchResult = await this.searchListingUseCase.execute({
      location,
      guestCount: guestCount ? Number(guestCount) : undefined,
      minPrice,
      maxPrice,
      limit: 20,
    });

    const artifactType = action === AgentAction.CHECK_AVAILABILITY
      ? ArtifactType.AVAILABILITY_CHECK
      : ArtifactType.LISTING_SEARCH_RESULT;

    const locationLabel = location ? ` in ${location}` : "";
    const dateLabel = dateRange ? ` for ${dateRange}` : "";
    const count = searchResult.listings.length;

    const summary = count > 0
      ? `Found ${count} listing(s)${locationLabel}${dateLabel}.`
      : `No listings found${locationLabel}${dateLabel}.`;

    return {
      success: true,
      domain: semantic.domain,
      primaryAction: {
        name: action,
        confidence: semantic.confidence ?? 0,
      },
      summary,
      artifacts: [{
        type: artifactType,
        content: {
          query: { location, dateRange, guestCount, minPrice, maxPrice },
          results: searchResult.listings,
          total: searchResult.total,
        } as Record<string, unknown>,
      }],
    };
  }

  private extractBookingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return semantic.entities.find(e => e.type === EntityType.BOOKING_ID)?.value
      ?? context.resources?.bookingId;
  }

  private extractListingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return semantic.entities.find(e => e.type === EntityType.LISTING_ID)?.value
      ?? context.resources?.listingId;
  }

  private extractEntity(semantic: SemanticContext, keys: string[]): string | undefined {
    return semantic.entities.find(e => keys.includes(e.type as string))?.value;
  }

  /**
   * BOOKING-002: Parse ordinal string to zero-based index.
   * "first" / "1" / "1st" → 0, "second" / "2" / "2nd" → 1, etc.
   */
  private parseOrdinal(ordinal: string | undefined): number {
    if (!ordinal) return 0; // default to first

    const map: Record<string, number> = {
      first: 0, second: 1, third: 2, fourth: 3, fifth: 4,
      "1st": 0, "2nd": 1, "3rd": 2, "4th": 3, "5th": 4,
    };

    const lower = ordinal.toLowerCase().trim();
    if (lower in map) return map[lower];

    const num = parseInt(lower, 10);
    if (!isNaN(num) && num >= 1) return num - 1;

    return 0; // fallback to first
  }

  private wrapResult(semantic: SemanticContext, summary: string, data: any[]) {
    return {
      success: true,
      domain: semantic.domain,
      primaryAction: {
        name: semantic.action?.type ?? "UNKNOWN",
        confidence: semantic.confidence ?? 0,
      },
      summary,
      artifacts: data.map(item => ({
        type: ArtifactType.BOOKING,
        content: item,
      })),
    };
  }
}
