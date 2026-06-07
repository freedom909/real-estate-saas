// src/ai-platform/schemas/intent.schema.ts

import { z } from "zod";

export const SemanticSchema =
  z.object({

    domain:
      z.string(),

    primaryAction:
      z.string(),

    actions:
      z.array(
        z.string()
      ),

    confidence:
      z.number(),

    entities:
      z.array(
        z.object({

          type:
            z.string(),

          value:
            z.string()

        })
      ).default([])
  });