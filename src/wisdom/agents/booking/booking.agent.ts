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
import { BookingState } from "@/core/booking/domain/state/booking-state";


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
   let searchResults = context.resources?.searchResults ?? [];

const sessionId = context.runtime?.sessionId ?? "default";

// Restore the previous booking draft from the session store.
const sessionMemory = this.sessionStore.get(sessionId);
const previousDraft = sessionMemory?.bookingDraft;

// Restore cached search results if the current request has none.
if (searchResults.length === 0) {
  searchResults = getCachedSearchResults(sessionId) ?? [];
}

console.log("[BookingAgent] Previous booking draft:", {
  listingId: previousDraft?.listingId,
  listingTitle: previousDraft?.listingTitle,
  status: previousDraft?.status,
  checkInDate: previousDraft?.checkInDate,
  checkOutDate: previousDraft?.checkOutDate,
});
const criteria = this.extractEntity(
  semantic,
  ["SELECTION_CRITERIA"],
);

const ordinal = this.extractEntity(
  semantic,
  ["ORDINAL"],
);
let resolvedListingId: string | undefined;

// 1. Explicit price selection
if (criteria) {
  const selected = this.selectListingByCriteria(
    criteria,
    searchResults,
  );

  resolvedListingId = selected?.id;
}

// 2. Explicit ordinal selection
if (!resolvedListingId && ordinal) {
  const index = this.parseOrdinal(ordinal);

  if (index !== undefined) {
    const actualIndex =
      index === -1 ? searchResults.length - 1 : index;

    resolvedListingId = searchResults[actualIndex]?.id;
  }
}

// 3. Explicit listing ID from current context
if (!resolvedListingId && !criteria && !ordinal) {
  resolvedListingId = listingId;
}

// 4. Match property name in user's message
if (!resolvedListingId && searchResults.length > 0) {
  const matched = this.matchByTitle(
    semantic.rawInput,
    searchResults,
  );

  resolvedListingId = matched?.id;
}

// 5. Continue the previous booking if the user
// has not selected another listing in this message.
if (
  !resolvedListingId &&
  !criteria &&
  !ordinal &&
  !listingId &&
  previousDraft?.status === BookingState.AWAITING_DATES &&
  previousDraft.listingId
) {
  resolvedListingId = previousDraft.listingId;

  console.log(
    "[BookingAgent] Restored listing from previous booking:",
    resolvedListingId
  );
}

// 6. If there is no previous booking, but exactly one
// listing is available, select it automatically.
if (!resolvedListingId && searchResults.length === 1) {
  resolvedListingId = searchResults[0].id;
}


if (!resolvedListingId) {
  const hasMultipleListings = searchResults.length > 1;
  const hasNoListings = searchResults.length === 0;

  let summary: string;

  if (hasMultipleListings) {
    summary =
      "どの宿泊施設を予約しますか？検索結果から予約したい宿泊施設を選択してください。";
  } else if (hasNoListings) {
    summary =
      "どの宿泊施設を予約しますか？まず宿泊施設を検索してください。";
  } else {
    summary =
      "予約したい宿泊施設を教えてください。";
  }

  return {
    success: true,
    domain: semantic.domain as any,
    primaryAction: {
      name: AgentAction.CREATE_BOOKING,
      confidence: semantic.confidence ?? 0,
    },
    summary,
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

if (resolved) {
  resolvedCheckIn = resolved.checkInDate.toISOString();
  resolvedCheckOut = resolved.checkOutDate.toISOString();
}
    }

    if (!resolvedCheckIn || !resolvedCheckOut) {
     
const selectedListing = searchResults?.find(
  (r: any) => r.id === resolvedListingId
);

const listingTitle =
  selectedListing?.title ||
  previousDraft?.listingTitle ||
  resolvedListingId;
const pricePerNight = selectedListing?.pricePerNight ?? 0;

// Keep the original picture objects, including their signed URLs.
const pictures = Array.isArray(selectedListing?.pictures)
  ? selectedListing.pictures
  : [];

const picture = pictures[0] ?? null;

console.log("[LISTING_SELECTED DEBUG]", {
  listingId: resolvedListingId,
  listingTitle,
  pricePerNight,
  picture,
  pictures,
  pictureCount: pictures.length,
});

console.log(
  "[LISTING_SELECTED DEBUG]",
  JSON.stringify(
    {
      listingId: resolvedListingId,
      listingTitle,
      pricePerNight,
      picture,
      pictures,
    },
    null,
    2
  )
);
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
                pricePerNight,
                picture,
                pictures,
            },
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
const listingName =
  searchResults.find(
    (r: any) => r.id === resolvedListingId
  )?.title ||
  previousDraft?.listingTitle ||
  "ご宿泊先";

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
  const customerId = context.identity.user?.id;

  if (!customerId) {
    return {
      success: false,
      domain: "BOOKING" as any,
      primaryAction: {
        name: AgentAction.GET_BOOKING,
        confidence: 0.9,
      },
      summary: "予約を確認するにはログインが必要です。",
      artifacts: [],
    };
  }

  // Voice: do not require the customer to speak a booking ID.
  if (!bookingId || this.isVoiceRequest(context)) {
    const bookings =
      await this.getBookingsForCustomerUseCase.execute(customerId);

    if (bookings.length === 0) {
      return {
        success: true,
        domain: "BOOKING" as any,
        primaryAction: {
          name: AgentAction.GET_BOOKING,
          confidence: 0.95,
        },
        summary: "現在、ご予約はありません。",
        artifacts: [],
      };
    }

    return {
      success: true,
      domain: "BOOKING" as any,
      primaryAction: {
        name: AgentAction.GET_BOOKING,
        confidence: 0.9,
      },
      summary: "ご予約を確認します。宿泊施設名、チェックイン日、またはチェックアウト日を教えてください。",
      artifacts: [{
        type: ArtifactType.BOOKING_GET,
        content: {
          bookings,
        } as Record<string, unknown>,
      }],
    };
  }

  // This is an internal database ID lookup.
  // Do not pass a Reservation Number to findById().
  const result = await this.getBookingUseCase.execute(bookingId);

  // TODO: Verify customer ownership in the UseCase or authorization layer
  // before returning this booking.

  const listingName =
    context.resources?.searchResults?.find(
      (item: any) => item.id === result.listingId,
    )?.title ?? "ご宿泊先";

  const askedForNumber =
    /予約番号|予約番号を|番号を教えて/i.test(semantic.rawInput);

  const voiceInput: BookingVoiceInput = {
    listingName,
    price: result.price,
    checkInDate: new Date(result.dateRange.checkInDate),
    checkOutDate: new Date(result.dateRange.checkOutDate),
    status: result.status,
    ...(askedForNumber && result.reservationNumber
      ? { reservationNumber: result.reservationNumber }
      : {}),
  };

  const voiceDto = BookingVoiceMapper.toVoice(voiceInput);

  return {
    success: true,
    domain: "BOOKING" as any,
    primaryAction: {
      name: AgentAction.GET_BOOKING,
      confidence: 0.95,
    },
    summary: BookingVoiceMapper.toSentence(voiceDto),
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



private resolveDateRange(
  dateRange: string,
): { checkInDate: Date; checkOutDate: Date } | null {
  const match = dateRange.match(
    /(\d{4}-\d{2}-\d{2})\s*(?:to|～|~|から)\s*(\d{4}-\d{2}-\d{2})/i,
  );

  if (!match) return null;

  const checkInDate = new Date(match[1]);
  const checkOutDate = new Date(match[2]);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate
  ) {
    return null;
  }

  return { checkInDate, checkOutDate };
}



private isVoiceRequest(context: AIContext): boolean {
  return context.runtime.source === "voice";
}

private matchByTitle(
  message: string,
  searchResults: any[],
): { id: string } | null {
  const normalizedMessage = message
    .toLowerCase()
    .replace(
      /\b(book|reserve|booked|reserving|please|the|a|an|one|room|want|to)\b/gi,
      "",
    )
    .replace(/(予約する|予約|して|ください|の|を|が|へ|に|で|は|も)/g, "")
    .trim();

  if (!normalizedMessage) return null;

  const keywords = normalizedMessage
    .split(/\s+/)
    .filter((word) => word.length >= 2);

  if (keywords.length === 0) return null;

  let bestMatch: { id: string } | null = null;
  let bestScore = 0;

  for (const listing of searchResults) {
    const searchable = [
      listing.title,
      listing.address,
      listing.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchCount = keywords.filter((keyword) =>
      searchable.includes(keyword),
    ).length;

    const score = matchCount / keywords.length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { id: listing.id };
    }
  }

  return bestMatch;
}

private selectListingByCriteria(
  criteria: string,
  searchResults: any[],
): any | undefined {
  const priceOf = (listing: any): number =>
    Number(listing?.price ?? listing?.pricePerNight);

  const pricedListings = searchResults.filter((listing) =>
    Number.isFinite(priceOf(listing)),
  );

  if (pricedListings.length === 0) return undefined;

  switch (criteria) {
    case "CHEAPEST":
    case "PRICE_ASC":
      return [...pricedListings].sort(
        (a, b) => priceOf(a) - priceOf(b),
      )[0];

    case "MOST_EXPENSIVE":
    case "PRICE_DESC":
      return [...pricedListings].sort(
        (a, b) => priceOf(b) - priceOf(a),
      )[0];

    default:
      return undefined;
  }
}

private extractBookingId(
  semantic: SemanticContext,
  context: AIContext,
): string | undefined {
  const fromEntity = semantic.entities.find(
    (entity) =>
      entity.type === EntityType.BOOKING ||
      entity.type === EntityType.BOOKING_ID,
  )?.value;

  if (fromEntity) return String(fromEntity);

  const fromResources = context.resources?.bookingId;

  if (fromResources) return String(fromResources);

  // Do not automatically select session.lastBookingId.
  // It may be ambiguous or refer to a different booking.
  return undefined;
}

private extractListingId(
  semantic: SemanticContext,
  context: AIContext,
): string | undefined {
  const fromEntity = semantic.entities.find(
    (entity) =>
      entity.type === EntityType.LISTING ||
      entity.type === EntityType.LISTING_ID,
  )?.value;

  return (
    (fromEntity as string | undefined) ??
    (context.resources?.listingId as string | undefined)
  );
}

private extractEntity(
  semantic: SemanticContext,
  types: string[],
): string | undefined {
  const entity = semantic.entities.find((item) =>
    types.includes(item.type),
  );

  return entity?.value == null ? undefined : String(entity.value);
}

private parseOrdinal(
  ordinal: string | undefined,
): number | undefined {
  if (!ordinal) return undefined;

  const map: Record<string, number> = {
    first: 0,
    second: 1,
    third: 2,
    fourth: 3,
    fifth: 4,
    latest: -1,
    last: -1,
  };

  return map[ordinal.toLowerCase()];
}

}
