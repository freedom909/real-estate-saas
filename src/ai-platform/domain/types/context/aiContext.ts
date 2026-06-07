export interface AIRequest {
  message: string;

  context: AIContext;
}

export interface AIContext {

  user: {
    id: string;
  };

  source: "web" | "mobile" | "voice" | "api";

  sessionId?: string;

  locale?: string;

  timezone?: string;

  device?: {
    type: "desktop" | "mobile" | "voice";
  };

  resources: {
    listingId?: string;
    bookingId?: string;
    reviewId?: string;
  };

  ui?: {
    screen?: string;     // mobile / web page
    component?: string;
  };

  voice?: {
    transcriptConfidence?: number;
  };
}