// src/wisdom/agents/booking/booking.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../contracts/agent";
import { AgentAction, SemanticContext } from "../../semantic/semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ArtifactType } from "../../shared/enums/artifact-type.enum";
import { AIContext } from "../../contracts/ai-context";
import { WisdomResponse } from "../../contracts/response";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { GetBookingsForGuestUseCase } from "@/core/booking/application/usecases/getBookingsForGuest.useCase";
import { SearchListingUseCase } from "@/core/listing/application/usecase/searchListingUseCase";
import { GetLatestBookingForGuestUseCase } from "@/core/booking/application/usecases/getLatestBookingForGuest.useCase";
import { SemanticEntityType } from "@/wisdom/semantic/semantic.entityType";

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
    @inject(delay(() => GetLatestBookingForGuestUseCase))
    private getLatestBookingForGuestUseCase: GetLatestBookingForGuestUseCase,
  ) {}

  async execute(semantic: SemanticContext, context: AIContext): Promise<WisdomResponse> {
    const action = semantic.action?.type;
    const bookingId = this.extractBookingId(semantic, context);
    const listingId = this.extractListingId(semantic, context);

    switch (action) {
      case AgentAction.SEARCH_LISTING:
      case AgentAction.CHECK_AVAILABILITY:
        return this.handleSearchOrAvailability(semantic, action);

      case AgentAction.CREATE_BOOKING:
        return this.handleCreateBooking(semantic, context, listingId);

      case AgentAction.CANCEL_BOOKING:
        return this.handleCancelBooking(bookingId);

      case AgentAction.GET_BOOKING:
        return this.handleGetBooking(bookingId);

      case AgentAction.GET_MY_BOOKINGS:
        return this.handleGetMyBookings(context);

      case AgentAction.CONFIRM_BOOKING:
        return this.handleConfirmBooking(bookingId);

      case AgentAction.COMPLETE_BOOKING:
        return this.handleCompleteBooking(bookingId);

      default:
        return {
          success: false,
          domain: semantic.domain as any,
          primaryAction: { name: action ?? "UNKNOWN", confidence: semantic.confidence ?? 0 },
          summary: `Unsupported booking action: ${action}`,
          artifacts: [],
        };
    }
  }

  // ─── CREATE BOOKING ──────────────────────────────────────────

  private async handleCreateBooking(
    semantic: SemanticContext,
    context: AIContext,
    listingId: string | undefined,
  ): Promise<WisdomResponse> {
    // Resolve listingId from searchResults if ordinal was used
    let resolvedListingId = listingId;
    if (!resolvedListingId && context.resources?.searchResults?.length) {
      const ordinal = this.extractEntity(semantic, ["ORDINAL"]);
      const index = this.parseOrdinal(ordinal);
      const match = context.resources.searchResults[index];
      if (match) {
        resolvedListingId = match.id;
      }
    }

    if (!resolvedListingId) {
      return {
        success: true,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary: "Which listing would you like to book? Please search for listings first or provide a listing ID.",
        artifacts: [],
      };
    }

    const checkIn = this.extractEntity(semantic, ["check_in", "checkIn", "CHECK_IN", "check_in_date"]);
    const checkOut = this.extractEntity(semantic, ["check_out", "checkOut", "CHECK_OUT", "check_out_date"]);

    let resolvedCheckIn = checkIn;
    let resolvedCheckOut = checkOut;

    // Fallback: use DATE_RANGE for both
    const dateRange = this.extractEntity(semantic, ["DATE_RANGE", "date_range"]);
    if ((!resolvedCheckIn || !resolvedCheckOut) && dateRange) {
      const resolved = this.resolveDateRange(dateRange);
      resolvedCheckIn = resolved.checkInDate.toISOString();
      resolvedCheckOut = resolved.checkOutDate.toISOString();
    }

    if (!resolvedCheckIn || !resolvedCheckOut) {
      const listingTitle = context.resources?.searchResults?.find(
        (r: any) => r.id === resolvedListingId,
      )?.title || resolvedListingId;

      return {
        success: true,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary: `Great choice! You want to book "${listingTitle}". When would you like to check in and check out? Please provide dates like "July 5-10".`,
        artifacts: [{
          type: ArtifactType.BOOKING,
          content: {
            status: "awaiting_dates",
            listingId: resolvedListingId,
            listingTitle,
          },
        }],
      };
    }

    const guestCount = parseInt(this.extractEntity(semantic, ["GUEST_COUNT", "guest_count"]) ?? "1");

    const result = await this.createBookingUseCase.execute({
      listingId: resolvedListingId,
      guestId: context.identity.user?.id ?? "",
      checkInDate: new Date(resolvedCheckIn),
      checkOutDate: new Date(resolvedCheckOut),
      guestCount,
    });

    return {
      success: true,
      domain: semantic.domain as any,
      primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
      summary: `Booking confirmed! Your booking ID is ${result.id}. Check-in: ${resolvedCheckIn}, Check-out: ${resolvedCheckOut}.`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── CANCEL BOOKING ──────────────────────────────────────────

  private async handleCancelBooking(bookingId: string | undefined): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.CANCEL_BOOKING, confidence: 0.9 },
        summary: "Which booking would you like to cancel? Please provide the booking ID.",
        artifacts: [],
      };
    }

    const result = await this.cancelBookingUseCase.execute(bookingId, "Cancelled via AI assistant");
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.CANCEL_BOOKING, confidence: 0.95 },
      summary: `Booking ${bookingId} has been cancelled.`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── GET BOOKING ─────────────────────────────────────────────

  private async handleGetBooking(bookingId: string | undefined): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.GET_BOOKING, confidence: 0.9 },
        summary: "Which booking would you like to view? Please provide the booking ID.",
        artifacts: [],
      };
    }

    const result = await this.getBookingUseCase.execute(bookingId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.GET_BOOKING, confidence: 0.95 },
      summary: `Booking ${bookingId}: status=${result.status}.`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── GET MY BOOKINGS ─────────────────────────────────────────

  private async handleGetMyBookings(context: AIContext): Promise<WisdomResponse> {
    const guestId = context.identity.user?.id;
    if (!guestId) {
      return {
        success: false,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.GET_MY_BOOKINGS, confidence: 0.9 },
        summary: "Please log in to view your bookings.",
        artifacts: [],
      };
    }

    const result = await this.getBookingsForGuestUseCase.execute(guestId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.GET_MY_BOOKINGS, confidence: 0.95 },
      summary: `You have ${result.length} booking(s).`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: { bookings: result } as Record<string, unknown>,
      }],
    };
  }

  // ─── CONFIRM BOOKING ─────────────────────────────────────────

  private async handleConfirmBooking(bookingId: string | undefined): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.CONFIRM_BOOKING, confidence: 0.9 },
        summary: "Which booking would you like to confirm? Please provide the booking ID.",
        artifacts: [],
      };
    }

    const result = await this.confirmBookingUseCase.execute(bookingId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.CONFIRM_BOOKING, confidence: 0.95 },
      summary: `Booking ${bookingId} has been confirmed.`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── COMPLETE BOOKING ────────────────────────────────────────

  private async handleCompleteBooking(bookingId: string | undefined): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.COMPLETE_BOOKING, confidence: 0.9 },
        summary: "Which booking would you like to complete? Please provide the booking ID.",
        artifacts: [],
      };
    }

    const result = await this.completeBookingUseCase.execute(bookingId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.COMPLETE_BOOKING, confidence: 0.95 },
      summary: `Booking ${bookingId} has been completed.`,
      artifacts: [{
        type: ArtifactType.BOOKING,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── SEARCH / AVAILABILITY ───────────────────────────────────

  private async handleSearchOrAvailability(
    semantic: SemanticContext,
    action: AgentAction,
  ): Promise<WisdomResponse> {
    const searchResult = await this.searchListingUseCase.execute({});
    return {
      success: true,
      domain: semantic.domain as any,
      primaryAction: { name: action, confidence: semantic.confidence ?? 0 },
      summary: `Found ${searchResult.total} listings.`,
      artifacts: [{
        type: ArtifactType.LISTING_SEARCH_RESULT,
        content: searchResult as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  private extractBookingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return (
      semantic.entities.find((e) => e.type === SemanticEntityType.BOOKING)?.value ??
      context.resources?.bookingId
    );
  }

  private extractListingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return (
      semantic.entities.find((e) => e.type === SemanticEntityType.LISTING)?.value ??
      context.resources?.listingId
    );
  }

  private extractEntity(semantic: SemanticContext, types: string[]): string | undefined {
    return semantic.entities.find((e) => types.includes(e.type))?.value;
  }

  private parseOrdinal(ordinal: string | undefined): number {
    const map: Record<string, number> = { first: 0, second: 1, third: 2, latest: -1 };
    return map[ordinal ?? ""] ?? 0;
  }

  private resolveDateRange(dateRange: string): { checkInDate: Date; checkOutDate: Date } {
    const now = new Date();
    const checkInDate = new Date(now);
    checkInDate.setDate(now.getDate() + 1);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 1);
    return { checkInDate, checkOutDate };
  }
}
