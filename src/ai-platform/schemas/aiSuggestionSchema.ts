
// src/ai-platform/schemas/aiSuggestionSchema.ts
import { z } from "zod";

export const AISuggestionSchema =
  z.object({
    listingId:
      z.string(),

    type:
      z.enum([
        "TITLE",
        "DESCRIPTION"
      ]),

    suggestion:
      z.string(),

    confidence:
      z.number()
  });

export type AISuggestion =
  z.infer<
    typeof AISuggestionSchema
  >;