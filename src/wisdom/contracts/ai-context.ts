// src/wisdom/contracts/ai-context.ts
// Replaces the deleted @/ai-platform/context/types/context/ai.context.ts
// src/wisdom/contracts/ai-context.ts

export interface BookingDraft {
  listingId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
}

export interface AIContext {
  identity: IdentityContext;
  runtime: RuntimeContext;
  resources: ResourceContext;
  trace: TraceContext;
}


export interface AIUser {
  id: string;
  email?: string;
  role?: string;
}

export interface IdentityContext {
  sessionId?: string;
  user?: AIUser;
  tenant?: string;
}

export interface RuntimeContext {
  source: "web" | "mobile" | "voice" | "api";
  locale?: string;
  timezone?: string;
  sessionId?: string;
  device?: {
    type: string;
    [key: string]: any;
  };
  ui?: {
    screen?: string;
    component?: string;
  };
  voice?: {
    transcriptConfidence?: number;
  };
  currentFlow?: string;
}

export interface SearchListingResult {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  numOfBeds: number;
  numOfGuests: number;
  numOfBathrooms: number;
  numOfRooms: number;
  picture: string[];
  isFeatured: boolean;
}

export interface BookingDraft {
  listingId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
}

export interface ResourceContext {
  guestCount: number;
  checkOut: string;
  checkIn: string;
  location: string;
  listingId?: string;
  bookingId?: string;
  reviewId?: string;
  searchResults?: SearchListingResult[];
  bookingDraft?: BookingDraft;
  // Confirmed Booking
  booking?: {
    id?: string;
    listingId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
  };
}

export interface TraceContext {
  correlationId: string;
}



export interface AIRequest {
  message: string;
  context: AIContext;
}
