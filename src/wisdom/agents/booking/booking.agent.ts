// src/wisdom/agents/booking/booking.agent.ts

import { inject, injectable, delay } from "tsyringe";
import { IDomainAgent } from "../../contracts/agent";
import { EntityType, SemanticContext } from "../../semantic/semantic-context";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";

import { ArtifactType } from "../../shared/enums/artifact-type.enum";
import { AIContext } from "../../contracts/ai-context";
import { WisdomResponse } from "../../contracts/response";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { GetLatestBookingForCustomerUseCase } from "@/core/booking/application/usecases/getLatestBookingForCustomer.useCase";
import { GetBookingsForCustomerUseCase } from "@/core/booking/application/usecases/getBookingsForCustomer.useCase";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { getCachedSearchResults } from "@/wisdom/memory/search-results-cache";



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
    @inject(delay(() => GetBookingsForCustomerUseCase))
    private getBookingsForCustomerUseCase: GetBookingsForCustomerUseCase,

    @inject(delay(() => GetLatestBookingForCustomerUseCase))
    private getLatestBookingForCustomerUseCase: GetLatestBookingForCustomerUseCase,//it was not used

    @inject(WISDOM_TOKENS.memory.sessionStore)
    private sessionStore: MemorySessionStore,
  ) {}

  async execute(semantic: SemanticContext, context: AIContext): Promise<WisdomResponse> {
    const action = semantic.action?.type;
    const bookingId = this.extractBookingId(semantic, context);
    const listingId = this.extractListingId(semantic, context);

    switch (action) {

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

      case AgentAction.GET_LATEST_BOOKING:
        return this.handleGetBooking(bookingId);

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

    // If no listing ID, try to reload search results from cache
    if (!resolvedListingId) {
      let searchResults = context.resources?.searchResults;
      if (!searchResults || searchResults.length === 0) {
        const sessionId = context.runtime?.sessionId ?? "default";
        searchResults = getCachedSearchResults(sessionId);
        console.log("[BookingAgent] Reloaded searchResults from cache:", searchResults.length);
      }
      if (searchResults?.length) {
        const ordinal = this.extractEntity(semantic, ["ORDINAL"]);
        const index = this.parseOrdinal(ordinal);
        const match = searchResults[index];
        if (match) {
          resolvedListingId = match.id;
        }
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

    const checkIn = this.extractEntity(semantic, ["check_in", "checkIn", "CHECK_IN", "check_in_date", "CHECK_IN_DATE"]);
    const checkOut = this.extractEntity(semantic, ["check_out", "checkOut", "CHECK_OUT", "check_out_date", "CHECK_OUT_DATE"]);

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
        artifacts:[
        {
            type: ArtifactType.LISTING_SELECTED,
            content:{
                listingId:resolvedListingId,
                listingTitle,
            }
        }
    ]
      };
    }

    const customerCount = parseInt(this.extractEntity(semantic, ["CUSTOMER_COUNT", "customer_count", "guest_count"]) ?? "1");

    const result = await this.createBookingUseCase.execute({
      listingId: resolvedListingId,
      customerId: context.identity.user?.id ?? "",
      checkInDate: new Date(resolvedCheckIn),
      checkOutDate: new Date(resolvedCheckOut),
      customerCount,
    });

    return {
      success: true,
      domain: semantic.domain as any,
      primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
      summary: `Booking confirmed! Your booking ID is ${result.id}. Check-in: ${resolvedCheckIn}, Check-out: ${resolvedCheckOut}.`,
      artifacts: [{
        type: ArtifactType.BOOKING_CREATED,
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
        type: ArtifactType.BOOKING_CANCELLED,
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
        type: ArtifactType.BOOKING_GET,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── GET MY BOOKINGS ─────────────────────────────────────────

  private async handleGetMyBookings(context: AIContext): Promise<WisdomResponse> {
    const customerId = context.identity.user?.id;
    if (!customerId) {
      return {
        success: false,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.GET_MY_BOOKINGS, confidence: 0.9 },
        summary: "Please log in to view your bookings.",
        artifacts: [],
      };
    }

    const result = await this.getBookingsForCustomerUseCase.execute(customerId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.GET_MY_BOOKINGS, confidence: 0.95 },
      summary: `You have ${result.length} booking(s).`,
      artifacts: [{
        type: ArtifactType.BOOKING_GET,
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
        type: ArtifactType.BOOKING_CONFIRMED,
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
        type: ArtifactType.BOOKING_COMPLETED,
        content: result as unknown as Record<string, unknown>,
      }],
    };
  }


  // ─── HELPERS ─────────────────────────────────────────────────

  private extractBookingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return (
      semantic.entities.find((e) => e.type === EntityType.BOOKING || e.type === EntityType.BOOKING_ID)?.value as string ??
      context.resources?.bookingId as string
    );
  }

  private extractListingId(semantic: SemanticContext, context: AIContext): string | undefined {
    return (
      semantic.entities.find((e) => e.type === EntityType.LISTING || e.type === EntityType.LISTING_ID)?.value as string ??
      context.resources?.listingId as string
    );
  }

  private extractEntity(semantic: SemanticContext, types: string[]): string | undefined {
    return semantic.entities.find((e) => types.includes(e.type))?.value as string;
  }

  private parseOrdinal(ordinal: string | undefined): number {
    const map: Record<string, number> = { first: 0, second: 1, third: 2, latest: -1 };
    return map[ordinal ?? ""] ?? 0;
  }

  private resolveDateRange(dateRange: string): { checkInDate: Date; checkOutDate: Date } {
    const now = new Date();

    // Try "YYYY-MM-DD to YYYY-MM-DD" or "MM-DD to MM-DD"
    const dashMatch = dateRange.match(/(\d{1,4}[-/]\d{1,2}[-/]?\d{0,2})\s*(?:to|～|~)\s*(\d{1,4}[-/]\d{1,2}[-/]?\d{0,2})/i);
    if (dashMatch) {
      const checkInDate = new Date(dashMatch[1]);
      const checkOutDate = new Date(dashMatch[2]);
      if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        return { checkInDate, checkOutDate };
      }
    }

    // Try "Month Day" format (e.g., "July 5")
    const monthDayMatch = dateRange.match(/([A-Za-z]+)\s+(\d{1,2})/i);
    if (monthDayMatch) {
      const date = new Date(`${monthDayMatch[1]} ${monthDayMatch[2]}, ${now.getFullYear()}`);
      if (!isNaN(date.getTime())) {
        const checkInDate = date;
        const checkOutDate = new Date(date);
        checkOutDate.setDate(date.getDate() + 1);
        return { checkInDate, checkOutDate };
      }
    }

    // Fallback: tomorrow to day after
    const checkInDate = new Date(now);
    checkInDate.setDate(now.getDate() + 1);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 1);
    return { checkInDate, checkOutDate };
  }
}
