import { BookingSnapshot } from "../snapshot/booking.snapshot";
import { ListingSnapshot } from "../snapshot/listing.snapshot";
import { ReviewSnapshot } from "../snapshot/review.snapshot";

export interface AIRequest {
  message: string;
  context: AIContext;
}

export interface AIContext {
  identity: IdentityContext;
  runtime: RuntimeContext;
  resources: ResourceContext;
  trace?: TraceContext;
  metadata?: Record<string, any>;
}

export interface IdentityContext {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
  tenant?: {
    id: string;
  };
}

export interface RuntimeContext {
  source:
    | "web"
    | "mobile"
    | "voice"
    | "api";
  sessionId?: string;
  locale?: string;
  timezone?: string;
  device?: {
    type:
      | "desktop"
      | "mobile"
      | "voice"
  };
  ui?: {
    screen?: string;
    component?: string;
  };
  voice?: {
    transcriptConfidence?: number;
  };
}

export interface ResourceContext {

  // direct selection
  listingId?: string;
  bookingId?: string;
  reviewId?: string;

  // snapshots
  listing?: ListingSnapshot;
  booking?: BookingSnapshot;
  review?: ReviewSnapshot;

  // 💡 IMPORTANT: unified memory for multi-turn reference resolution
  searchResults?: SearchListingResult[];

  // optional future
  lastActionResult?: unknown;
}

export interface SearchListingResult {
  id: string;
  title: string;
  price: number;
  address: string;
}

export interface TraceContext {
  correlationId?: string;
}
