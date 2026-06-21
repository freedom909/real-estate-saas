//
import { inject, injectable } from "tsyringe";

import {
  SemanticContext,
  Entity,
  EntityType,
  AgentAction,

} from "../../semantic-context";



import { OpenAIAdapter }
  from "@/ai-platform/infrastructure/adapters/openai.adapter";

import { AIDomain }
  from "../../types/ai.domain";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ListingOptimizationResult } from "@/core/listing/application/dto/listingOptimization.result";
import { SemanticSchema } from "@/ai-platform/schemas/semantic.schema";




@injectable()
export default class LLMExtractor {

  constructor(
    @inject(TOKENS_AI.OpenAIAdapter)
    private ai: OpenAIAdapter
  ) { }

  async extract(
    message: string
  ): Promise<SemanticContext> {

    const prompt = `
You are an AI intent classifier for a minshuku (民宿) listing platform.

Return ONLY valid JSON.
No markdown.
No explanation.

Domains:
- LISTING
- BOOKING
- REVIEW
- GENERAL

Available primaryAction:
- OPTIMIZE_TITLE (user wants to improve listing title)
- OPTIMIZE_DESCRIPTION (user wants to improve listing description)
- SEO_ANALYSIS (user wants SEO analysis for a listing)
- SEARCH_LISTING (user wants to find/search listings)
- CHECK_AVAILABILITY (user wants to check availability)
- GET_LISTING (user wants to view a specific listing)
- CREATE_BOOKING
- CANCEL_BOOKING
- GENERAL

Rules:
- primaryAction is REQUIRED
- Extract LISTING_ID entity when user references a specific listing
- Extract LOCATION entity when user mentions a place
- Extract DATE_RANGE entity when user mentions dates
- Extract GUEST_COUNT entity when user mentions number of guests

Output format:

{
  "domain":"LISTING",
  "primaryAction":"OPTIMIZE_TITLE",
  "confidence":0.95,
  "entities":[
    {"type":"LISTING_ID","value":"123"}
  ]
}

Examples:

User: "show me rooms in Kyoto"
=> {"domain":"LISTING","primaryAction":"SEARCH_LISTING","confidence":0.95,"entities":[{"type":"LOCATION","value":"Kyoto"}]}

User: "find listings near Osaka"
=> {"domain":"LISTING","primaryAction":"SEARCH_LISTING","confidence":0.95,"entities":[{"type":"LOCATION","value":"Osaka"}]}

User: "is listing 123 available tomorrow"
=> {"domain":"LISTING","primaryAction":"CHECK_AVAILABILITY","confidence":0.9,"entities":[{"type":"LISTING_ID","value":"123"},{"type":"DATE_RANGE","value":"tomorrow"}]}

User: "optimize the title of listing 456"
=> {"domain":"LISTING","primaryAction":"OPTIMIZE_TITLE","confidence":0.95,"entities":[{"type":"LISTING_ID","value":"456"}]}

User input:
${message}
`;

    const response = await this.ai.generateText({
      prompt
    })  as unknown as ListingOptimizationResult;

    console.log("RAW AI", response);
    const raw = typeof response === 'string' ? response : JSON.stringify(response);

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    console.log(
  "CLEANED AI >>>",
  cleaned
);

 let parsed;

try {

  parsed = JSON.parse(cleaned);

} catch (error) {

  console.error(
    "JSON PARSE ERROR"
  );

  console.error(cleaned);

  throw error;
}

    console.log(
      "PARSED",
      parsed
    );


    const validated =
      SemanticSchema.parse(parsed);

    console.log(
      "VALIDATED",
      validated
    );

    // ============================================
    // ENTITY-BASED ACTION OVERRIDE (critical)
    // ============================================
    // The LLM may misclassify intent based on wording.
    // "book a room in Kyoto" → LLM says CREATE_BOOKING
    // But without a listingId, the user is actually SEARCHING.
    const resolvedAction = this.resolveActionFromEntities(
      validated.primaryAction,
      validated.entities
    );

    const action = {
      type: resolvedAction as AgentAction,
      confidence: validated.confidence,
    };
    console.log("ACTION (resolved)", action);

    // Schema already normalizes entity types to UPPERCASE via SemanticSchema.
    // Do NOT .toLowerCase() here — BookingAgent compares against EntityType enum values
    // which are UPPERCASE (e.g. EntityType.LOCATION === "LOCATION").
    const entities: Entity[] =
      validated.entities.map((e) => ({
        type: e.type as EntityType,
        value: e.value,
      }));

    console.log(
      "ENTITIES",
      entities
    );

    return new SemanticContext(
      message,
      entities,
      action,
      validated.confidence,
      validated.domain as AIDomain,
      false
    );
  }

  // ======================================
  // Entity-Based Action Resolution
  // ======================================
  // Same deterministic rules as booking extractor.
  // Overrides LLM classification based on entity presence.
  private resolveActionFromEntities(
    llmAction: string,
    entities: { type: string; value: string }[]
  ): string {

    const has = (type: string) =>
      entities.some(e => e.type.toUpperCase() === type.toUpperCase());

    const listingId = has("LISTING_ID");
    const bookingId = has("BOOKING_ID");
    const location = has("LOCATION");
    const dateRange = has("DATE_RANGE");

    // Rule 1: CREATE_BOOKING requires listingId
    if (llmAction === "CREATE_BOOKING" && !listingId) {
      console.log("🔄 OVERRIDE: CREATE_BOOKING → SEARCH_LISTING (no listingId)");
      return "SEARCH_LISTING";
    }

    // Rule 2: CANCEL/CONFIRM/COMPLETE/MODIFY requires bookingId
    if (["CANCEL_BOOKING", "CONFIRM_BOOKING", "COMPLETE_BOOKING", "MODIFY_BOOKING"].includes(llmAction) && !bookingId) {
      console.log(`🔄 OVERRIDE: ${llmAction} → GET_MY_BOOKINGS (no bookingId)`);
      return "GET_MY_BOOKINGS";
    }

    // Rule 3: location + dateRange without listingId → SEARCH_LISTING
    if (location && dateRange && !listingId && !bookingId) {
      if (llmAction !== "SEARCH_LISTING") {
        console.log("🔄 OVERRIDE: location+dateRange → SEARCH_LISTING");
        return "SEARCH_LISTING";
      }
    }

    // Rule 4: location without listingId → SEARCH_LISTING
    if (location && !listingId && !bookingId) {
      if (llmAction === "CREATE_BOOKING" || llmAction === "CHECK_AVAILABILITY") {
        console.log("🔄 OVERRIDE: location only → SEARCH_LISTING");
        return "SEARCH_LISTING";
      }
    }

    // Rule 5: CHECK_AVAILABILITY requires listingId
    if (llmAction === "CHECK_AVAILABILITY" && !listingId) {
      console.log("🔄 OVERRIDE: CHECK_AVAILABILITY → SEARCH_LISTING (no listingId)");
      return "SEARCH_LISTING";
    }

    return llmAction;
  }
}
