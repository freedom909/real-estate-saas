
// src/ai-platform/schemas/aiSuggestionSchema.ts
import { z } from "zod";

export const AIArtifactSchema =
  z.object({

    type:
      z.string(),

    content:
      z.unknown(),

    confidence:
      z.number().optional()
  });

export type AIArtifact =
  z.infer<
    typeof AIArtifactSchema
  >;