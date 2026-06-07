export interface AIRequest {
  message: string;

  context: AIContext;
}

export interface AIContext {

user: {
  id: string;

  role?: string;

  email?: string;
}
tenant?: {
  id: string;
}
  source: "web" | "mobile" | "voice" | "api";

  sessionId?: string;

  locale?: string;

  timezone?: string;

  device?: {
    type: "desktop" | "mobile" | "voice";
  };



  trace?: {
  correlationId?: string;
}
  resources: {
    listingId?: string;
    bookingId?: string;
    reviewId?: string;
      conversationId?: string;
  messageId?: string;
  };

  ui?: {
    screen?: string;     // mobile / web page
    component?: string;
  };

  voice?: {
    transcriptConfidence?: number;
  };
}