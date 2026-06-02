// src/ai-platform/contracts/ai-suggestion.dto.ts

export interface AISuggestionDTO {
  listingId: string;

  type: "TITLE" | "DESCRIPTION";

  suggestion: string;

  confidence: number;

  model?: string;

  createdAt?: string;
}