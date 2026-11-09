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
import { GetBookingsForCustomerUseCase } from "@/core/booking/application/usecases/getBookingsForCustomer.useCase";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { getCachedSearchResults } from "@/wisdom/memory/search-results-cache";
import { BookingVoiceMapper, BookingVoiceInput } from "./bookingPresentation/voice.mapper";


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
        return this.handleCancelBooking(bookingId, semantic, context);

      case AgentAction.GET_BOOKING:
        return this.handleGetBooking(bookingId, semantic, context);

      case AgentAction.GET_MY_BOOKINGS:
        return this.handleGetMyBookings(context);

      case AgentAction.CONFIRM_BOOKING:
        return this.handleConfirmBooking(bookingId, semantic, context);

      case AgentAction.COMPLETE_BOOKING:
        return this.handleCompleteBooking(bookingId, semantic, context);

      case AgentAction.GET_LATEST_BOOKING:
        return this.handleGetBooking(bookingId, semantic, context);

      default:
        return {
          success: false,
          domain: semantic.domain as any,
          primaryAction: { name: action ?? "UNKNOWN", confidence: semantic.confidence ?? 0 },
          summary: `対応していない予約操作です: ${action}`,
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
   

    // If no listing ID, try to reload search results from cache
  let searchResults = context.resources?.searchResults;

if (!searchResults || searchResults.length === 0) {
  const sessionId = context.runtime?.sessionId ?? "default";
  searchResults = getCachedSearchResults(sessionId);

  console.log(
    "[BookingAgent] Reloaded searchResults from cache:",
    searchResults.length,
  );
}
const criteria = this.extractEntity(
  semantic,
  ["SELECTION_CRITERIA"]
);

const ordinal = this.extractEntity(
  semantic,
  ["ORDINAL"]
);

const selectionCriteria = this.extractEntity(
  semantic,
  ["SELECTION_CRITERIA"]
);

if (!searchResults?.length) {
  const sessionId = context.runtime?.sessionId ?? "default";
  searchResults = getCachedSearchResults(sessionId);
}

let resolvedListingId: string | undefined;

// 1. 当前消息明确要求选择最便宜或最贵的酒店
if (criteria && searchResults?.length) {
  const pricedResults = searchResults.filter((item) =>
    Number.isFinite(Number(item.price))
  );

  if (criteria === "CHEAPEST" && pricedResults.length > 0) {
    const cheapest = [...pricedResults].sort(
      (a, b) =>
        Number(a.price) - Number(b.price)
    )[0];

    resolvedListingId = cheapest.id;
  }

  if (criteria === "MOST_EXPENSIVE" && pricedResults.length > 0) {
    const mostExpensive = [...pricedResults].sort(
      (a, b) =>
        Number(b.price) - Number(a.price)
    )[0];

    resolvedListingId = mostExpensive.id;
  }
}

// 2. 当前消息明确指定了第几家
if (!resolvedListingId && ordinal && searchResults?.length) {
  const index = this.parseOrdinal(ordinal);

  if (index !== undefined) {
    const actualIndex =
      index === -1 ? searchResults.length - 1 : index;

    resolvedListingId = searchResults[actualIndex]?.id;
  }
}

// 3. 没有新的明确选择条件，才使用已有 listingId
if (!resolvedListingId) {
  resolvedListingId = listingId;
}

// 4. 最后才尝试根据酒店名称匹配
if (!resolvedListingId && searchResults?.length) {
  const titleMatch = this.matchByTitle(
    semantic.rawInput,
    searchResults
  );

  if (titleMatch) {
    resolvedListingId = titleMatch.id;
  }
}

// 4. Reuse the previous listing only if the user did not
// provide a new selection in this message.
if (
  !resolvedListingId &&
  !selectionCriteria &&
  !ordinal
) {
  resolvedListingId =
    listingId ?? (context.resources?.listingId as string | undefined);
}

    if (!resolvedListingId) {
      return {
        success: true,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary: "予約したい物件はどれですか？まず物件を検索するか、物件IDを教えてください。",
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
        summary: `「${listingTitle}」を選びましたね。チェックインとチェックアウトの日程を教えてください。例：「7月25日から7月27日まで」`,
        artifacts:[{
            type: ArtifactType.LISTING_SELECTED,
            content:{
                listingId:resolvedListingId,
                listingTitle,
            }
        }]
      };
    }

    const customerCount = parseInt(this.extractEntity(semantic, ["CUSTOMER_COUNT", "customer_count", "guest_count"]) ?? "1");

    const customerId = context.identity.user?.id;
    if (!customerId) {
      return {
        success: false,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary: "予約をするにはログインが必要です。",
        artifacts: [],
      };
    }

    try {
      
      const input = {
  listingId: resolvedListingId,
  checkInDate: resolvedCheckIn,
  checkOutDate: resolvedCheckOut,
  customerCount,
};

const actor = {
  customerId,
  tenantId: context.identity.tenant ?? null,
};

const result = await this.createBookingUseCase.execute(
  input,
  actor,
);

      // Build voice response using mapper
      const listingName = context.resources?.searchResults?.find(
        (r: any) => r.id === resolvedListingId,
      )?.title || "ご宿泊先";

      const voiceInput: BookingVoiceInput = {
        listingName,
        price: result.price,
        checkInDate: new Date(result.dateRange.checkInDate),
        checkOutDate: new Date(result.dateRange.checkOutDate),
        status: result.status,
        action: "確認",
      };

      const voiceDto = BookingVoiceMapper.toVoice(voiceInput);
      const summary = BookingVoiceMapper.toSentence(voiceDto);

      // Store booking ID in session so follow-up commands (cancel, confirm, etc.) can find it
      const sessionId = context.runtime?.sessionId ?? "default";
      const session = this.sessionStore.getOrCreate(sessionId);
      session.lastBookingId = result.id;
      this.sessionStore.set(sessionId, session);

      return {
        success: true,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary,
        artifacts: [{
          type: ArtifactType.BOOKING_CREATED,
          content: result as unknown as Record<string, unknown>,
        }],
      };
    } catch (error: any) {
      console.error("[BookingAgent] Create booking error:", error?.message);
      return {
        success: false,
        domain: semantic.domain as any,
        primaryAction: { name: AgentAction.CREATE_BOOKING, confidence: semantic.confidence ?? 0 },
        summary: `予約の作成に失敗しました: ${error?.message || "不明なエラー"}。もう一度お試しください。`,
        artifacts: [],
      };
    }
  }

  // ─── CANCEL BOOKING ──────────────────────────────────────────

  private async handleCancelBooking(
    bookingId: string | undefined,
    _semantic: SemanticContext,
    context: AIContext,
  ): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.CANCEL_BOOKING, confidence: 0.9 },
        summary: "どの予約をキャンセルしますか？予約番号を教えてください。",
        artifacts: [],
      };
    }

    const result = await this.cancelBookingUseCase.execute(bookingId, "Cancelled via AI assistant");

    // result is a Booking entity instance
    const listingName = context.resources?.searchResults?.find(
      (r: any) => r.id === result.listingId,
    )?.title || "ご宿泊先";

    const voiceInput: BookingVoiceInput = {
      listingName,
      price: result.price,
      checkInDate: result.dateRange.checkInDate,
      checkOutDate: result.dateRange.checkOutDate,
      status: result.status,
      action: "キャンセル",
    };

    const voiceDto = BookingVoiceMapper.toVoice(voiceInput);
    const sentence = BookingVoiceMapper.toSentence(voiceDto);

    // Update session so follow-up commands track the acted-upon booking
    const sessionId = context.runtime?.sessionId ?? "default";
    const session = this.sessionStore.getOrCreate(sessionId);
    session.lastBookingId = bookingId;
    this.sessionStore.set(sessionId, session);

    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.CANCEL_BOOKING, confidence: 0.95 },
      summary: sentence,
      artifacts: [{
        type: ArtifactType.BOOKING_CANCELLED,
        content: result.toJSON() as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── GET BOOKING ─────────────────────────────────────────────

  private async handleGetBooking(
    bookingId: string | undefined,
    semantic: SemanticContext,
    context: AIContext,
  ): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.GET_BOOKING, confidence: 0.9 },
        summary: "どの予約を確認しますか？予約番号を教えてください。",
        artifacts: [],
      };
    }

    const result = await this.getBookingUseCase.execute(bookingId);

    // result is a toJSON() plain object
    const listingName = context.resources?.searchResults?.find(
      (r: any) => r.id === result.listingId,
    )?.title || "ご宿泊先";

    // Check if user explicitly asked for the booking ID/number
    const askedForId = /予約番号|予約ID|番号|ID/i.test(semantic.rawInput);

    const voiceInput: BookingVoiceInput = {
      listingName,
      price: result.price,
      checkInDate: new Date(result.dateRange.checkInDate),
      checkOutDate: new Date(result.dateRange.checkOutDate),
      status: result.status,
      // Only include reservation number when user asked for it
      ...(askedForId ? { reservationNumber: result.reservationNumber ?? result.id } : {}),
    };

    const voiceDto = BookingVoiceMapper.toVoice(voiceInput);
    const sentence = BookingVoiceMapper.toSentence(voiceDto);

    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.GET_BOOKING, confidence: 0.95 },
      summary: sentence,
      artifacts: [{
        type: ArtifactType.BOOKING_GET,
        content: result as Record<string, unknown>,
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
        summary: "予約を確認するにはログインが必要です。",
        artifacts: [],
      };
    }

    const result = await this.getBookingsForCustomerUseCase.execute(customerId);
    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.GET_MY_BOOKINGS, confidence: 0.95 },
      summary: `${result.length}件の予約があります。`,
      artifacts: [{
        type: ArtifactType.BOOKING_GET,
        content: { bookings: result } as Record<string, unknown>,
      }],
    };
  }

  // ─── CONFIRM BOOKING ─────────────────────────────────────────

  private async handleConfirmBooking(
    bookingId: string | undefined,
    _semantic: SemanticContext,
    context: AIContext,
  ): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.CONFIRM_BOOKING, confidence: 0.9 },
        summary: "どの予約を確定しますか？予約番号を教えてください。",
        artifacts: [],
      };
    }

    const result = await this.confirmBookingUseCase.execute(bookingId);

    // result is a Booking entity instance
    const listingName = context.resources?.searchResults?.find(
      (r: any) => r.id === result.listingId,
    )?.title || "ご宿泊先";

    const voiceInput: BookingVoiceInput = {
      listingName,
      price: result.price,
      checkInDate: result.dateRange.checkInDate,
      checkOutDate: result.dateRange.checkOutDate,
      status: result.status,
      action: "確定",
    };

    const voiceDto = BookingVoiceMapper.toVoice(voiceInput);
    const sentence = BookingVoiceMapper.toSentence(voiceDto);

    // Update session so follow-up commands track the acted-upon booking
    const sessionId = context.runtime?.sessionId ?? "default";
    const session = this.sessionStore.getOrCreate(sessionId);
    session.lastBookingId = bookingId;
    this.sessionStore.set(sessionId, session);

    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.CONFIRM_BOOKING, confidence: 0.95 },
      summary: sentence,
      artifacts: [{
        type: ArtifactType.BOOKING_CONFIRMED,
        content: result.toJSON() as unknown as Record<string, unknown>,
      }],
    };
  }

  // ─── COMPLETE BOOKING ────────────────────────────────────────

  private async handleCompleteBooking(
    bookingId: string | undefined,
    _semantic: SemanticContext,
    context: AIContext,
  ): Promise<WisdomResponse> {
    if (!bookingId) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: { name: AgentAction.COMPLETE_BOOKING, confidence: 0.9 },
        summary: "どの予約を完了しますか？予約番号を教えてください。",
        artifacts: [],
      };
    }

    const result = await this.completeBookingUseCase.execute(bookingId);

    // result is a toJSON() plain object
    const listingName = context.resources?.searchResults?.find(
      (r: any) => r.id === result.listingId,
    )?.title || "ご宿泊先";

    const voiceInput: BookingVoiceInput = {
      listingName,
      price: result.price,
      checkInDate: new Date(result.dateRange.checkInDate),
      checkOutDate: new Date(result.dateRange.checkOutDate),
      status: result.status,
      action: "完了",
    };

    const voiceDto = BookingVoiceMapper.toVoice(voiceInput);
    const sentence = BookingVoiceMapper.toSentence(voiceDto);

    // Update session so follow-up commands track the acted-upon booking
    const sessionId = context.runtime?.sessionId ?? "default";
    const session = this.sessionStore.getOrCreate(sessionId);
    session.lastBookingId = bookingId;
    this.sessionStore.set(sessionId, session);

    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: { name: AgentAction.COMPLETE_BOOKING, confidence: 0.95 },
      summary: sentence,
      artifacts: [{
        type: ArtifactType.BOOKING_COMPLETED,
        content: result as Record<string, unknown>,
      }],
    };
  }


  // ─── HELPERS ─────────────────────────────────────────────────
 
 private selectListingByCriteria(
  criteria: string,
  searchResults: any[],
): any | undefined {
  const listings = searchResults.filter(
    (listing) =>
      typeof listing.pricePerNight === "number" &&
      Number.isFinite(listing.pricePerNight),
  );

  if (listings.length === 0) {
    console.warn(
      "[BookingAgent] No valid pricePerNight in search results.",
    );
    return undefined;
  }

  switch (criteria) {
    case "CHEAPEST":
    case "PRICE_ASC":
      return [...listings].sort(
        (a, b) => a.pricePerNight - b.pricePerNight,
      )[0];

    case "MOST_EXPENSIVE":
    case "PRICE_DESC":
      return [...listings].sort(
        (a, b) => b.pricePerNight - a.pricePerNight,
      )[0];

    default:
      return undefined;
  }
}

  private matchByTitle(
    message: string,
    searchResults: any[],
  ): { id: string } | null {
    const description = message
      .toLowerCase()
      .replace(/\b(book|reserve|booked|reserving|i(?:'d| would) like|please|the|a|an|one|room|want|to)\b/gi, "")
      .replace(/(予約する|予約|して|ください|の|を|が|へ|に|で|は|も)/g, "")
      .trim();

    if (!description) return null;

    const keywords = description.split(/\s+/).filter((w) => w.length >= 2);
    if (keywords.length === 0) return null;

    let bestMatch: { id: string } | null = null;
    let bestScore = 0;

    for (const listing of searchResults) {
      const title = (listing.title ?? "").toLowerCase();
      const address = (listing.address ?? "").toLowerCase();
      const description = (listing.description ?? "").toLowerCase();
      const searchable = `${title} ${address} ${description}`;

      let matchCount = 0;
      for (const keyword of keywords) {
        if (searchable.includes(keyword)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const score = matchCount / keywords.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { id: listing.id };
        }
      }
    }

    return bestMatch;
  }

  private extractBookingId(semantic: SemanticContext, context: AIContext): string | undefined {
    // 1. Explicit entity from semantic extraction
    const fromEntity = semantic.entities.find(
      (e) => e.type === EntityType.BOOKING || e.type === EntityType.BOOKING_ID
    )?.value as string | undefined;
    if (fromEntity) return fromEntity;

    // 2. Explicit from context resources
    if (context.resources?.bookingId) return context.resources.bookingId as string;

    // 3. Fallback: last booking created/acted-on in this session
    const sessionId = context.runtime?.sessionId ?? "default";
    const session = this.sessionStore.get(sessionId);
    if (session?.lastBookingId) return session.lastBookingId;

    return undefined;
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

  private parseOrdinal(ordinal: string | undefined): number  | undefined {
    
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
