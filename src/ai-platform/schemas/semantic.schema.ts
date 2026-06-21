// src/ai-platform/schemas/semantic.schema.ts

import { z } from "zod";

/**
 * Flexible schema that normalizes LLM output before validation.
 *
 * LLMs commonly return:
 *   - `action` (singular) instead of `primaryAction`
 *   - `entities` as an object { key: value } instead of an array [{ type, value }]
 *   - missing `actions` array
 *
 * This schema accepts both formats and normalizes them.
 */
export const SemanticSchema = z
  .object({
    domain: z.string().default("GENERAL"),

    // Accept both `primaryAction` and `action` (singular)
    primaryAction: z.string().optional(),
    action: z.string().optional(),

    // Accept both array and missing
    actions: z.array(z.string()).optional(),

    confidence: z.number().default(0.5),

    // Accept both array-of-objects and flat object
    entities: z
      .union([
        z.array(
          z.object({
            type: z.string(),
            value: z.string(),
          })
        ),
        z.record(z.string(), z.unknown()),
      ])
      .optional(),
  })
  .transform((data) => {
    // --- primaryAction ---
    const primaryAction =
      data.primaryAction ?? data.action ?? "GENERAL";

    // --- actions ---
    const actions =
      data.actions && data.actions.length > 0
        ? data.actions
        : [primaryAction];

    // --- entities ---
    let entities: { type: string; value: string }[] = [];

    if (Array.isArray(data.entities)) {
      // Already an array — just ensure shape
      entities = data.entities.map((e) => ({
        type: String(e.type).toUpperCase(),
        value: String(e.value),
      }));
    } else if (
      data.entities &&
      typeof data.entities === "object"
    ) {
      // Flat object → convert to array
      entities = Object.entries(data.entities).map(
        ([key, value]) => ({
          type: key
            .replace(/\./g, "_")
            .replace(/-/g, "_")
            .replace(
              /([a-z])([A-Z])/g,
              "$1_$2"
            )
            .toUpperCase(),
          value: String(value),
        })
      );
    }

    return {
      domain: data.domain,
      primaryAction,
      actions,
      confidence: data.confidence,
      entities,
    };
  });
