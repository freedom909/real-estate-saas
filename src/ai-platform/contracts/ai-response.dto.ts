// src/ai-platform/contracts/ai-response.dto.ts
export interface AIResponseDTO {
  listingId: string;

  type: "TITLE" | "DESCRIPTION";

  suggestion: string;

  confidence: number;

  model?: string;

  createdAt?: string;
}