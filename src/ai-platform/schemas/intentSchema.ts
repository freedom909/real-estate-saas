// src/ai-platform/schemas/intent.schema.ts

import { z } from "zod";

export const IntentSchema = z.object({
  domain: z.string(),

  facet: z.string(),

  intent: z.string(),

  confidence: z.number(),

  entities: z.record(
    z.string(),
    z.any()
  ).optional()
});

export type IntentOutput =
  z.infer<typeof IntentSchema>;