// src/wisdom/semantic/extractors/llm.extractor.ts

import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { AgentAction } from "../../shared/enums/action.enum";
import { IOpenAITool } from "@/wisdom/tools/IOpenAI.tool";

import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { WisdomRequest } from "../../contracts/request";
import { SemanticSchema } from "@/wisdom/schemas/semantic.schema";

@injectable()
export class LLMExtractor {
  constructor(
    @inject(TOKENS_AI.OpenAITool)
    private ai: IOpenAITool,
  ) {}

  async extract(message: string, request?: WisdomRequest): Promise<SemanticContext> {
    const prompt = `
You are an AI intent classifier for a minshuku (民宿) listing platform.

Return ONLY valid JSON. No markdown. No explanation.

Domains: LISTING, BOOKING, REVIEW, GENERAL

Available primaryAction:
- OPTIMIZE_TITLE, OPTIMIZE_DESCRIPTION, SEO_ANALYSIS
- SEARCH_LISTING, CHECK_AVAILABILITY, GET_LISTING
- CREATE_BOOKING, CANCEL_BOOKING, GET_MY_BOOKINGS
- GENERAL

Rules:
- primaryAction is REQUIRED
- Extract entities: LISTING_ID, LOCATION, DATE_RANGE, GUEST_COUNT, ORDINAL
- ORDINAL: "first", "second", "third", "last", "latest"

Output: {"domain":"...","primaryAction":"...","confidence":0.95,"entities":[{"type":"...","value":"..."}]}

Examples:
User: "show me rooms in Kyoto" => {"domain":"LISTING","primaryAction":"SEARCH_LISTING","confidence":0.95,"entities":[{"type":"LOCATION","value":"Kyoto"}]}
User: "optimize the title of listing 456" => {"domain":"LISTING","primaryAction":"OPTIMIZE_TITLE","confidence":0.95,"entities":[{"type":"LISTING_ID","value":"456"}]}
User: "show my bookings" => {"domain":"BOOKING","primaryAction":"GET_MY_BOOKINGS","confidence":0.95,"entities":[]}
User: "book the first one" => {"domain":"BOOKING","primaryAction":"CREATE_BOOKING","confidence":0.95,"entities":[{"type":"ORDINAL","value":"first"}]}

User input:
${message}
`;

    const response = await this.ai.generateText({ prompt });
    const raw = typeof response === "string" ? response : JSON.stringify(response);
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return new SemanticContext(message, [], null, 0, AIDomain.GENERAL, false);
    }

    const result = SemanticSchema.parse(parsed);

    const entities = (result.entities ?? []).map((e: any) => ({
      type: this.mapEntityType(e.type),
      value: String(e.value),
    }));

    const actionType = this.mapAction(result.primaryAction);
    const domain = this.mapDomain(result.domain);

    // Fix domain if action implies a different domain
    const resolvedDomain = this.resolveDomainFromAction(actionType, domain);

    return new SemanticContext(
      message,
      entities,
      { type: actionType, confidence: result.confidence },
      result.confidence,
      resolvedDomain,
      false,
    );
  }

  private mapEntityType(type: string): EntityType {
    const map: Record<string, EntityType> = {
      LISTING_ID: EntityType.LISTING_ID,
      BOOKING_ID: EntityType.BOOKING_ID,
      CHECK_IN: EntityType.CHECK_IN,
      CHECK_OUT: EntityType.CHECK_OUT,
      LOCATION: EntityType.LOCATION,
      DATE_RANGE: EntityType.DATE_RANGE,
      GUEST_COUNT: EntityType.GUEST_COUNT,
      PRICE_RANGE: EntityType.PRICE_RANGE,
      ORDINAL: EntityType.ORDINAL,
      REVIEW_ID: EntityType.REVIEW_ID,
      USER_ID: EntityType.USER_ID,
      TENANT_ID: EntityType.TENANT_ID,
    };
    return map[type?.toUpperCase()] ?? EntityType.LISTING_ID;
  }

  private mapAction(action: string): AgentAction {
    const map: Record<string, AgentAction> = {
      OPTIMIZE_TITLE: AgentAction.OPTIMIZE_TITLE,
      OPTIMIZE_DESCRIPTION: AgentAction.OPTIMIZE_DESCRIPTION,
      SEO_ANALYSIS: AgentAction.SEO_ANALYSIS,
      SEARCH_LISTING: AgentAction.SEARCH_LISTING,
      CHECK_AVAILABILITY: AgentAction.CHECK_AVAILABILITY,
      GET_LISTING: AgentAction.GET_LISTING,
      CREATE_BOOKING: AgentAction.CREATE_BOOKING,
      CANCEL_BOOKING: AgentAction.CANCEL_BOOKING,
      CONFIRM_BOOKING: AgentAction.CONFIRM_BOOKING,
      GET_MY_BOOKINGS: AgentAction.GET_MY_BOOKINGS,
      GENERAL: AgentAction.GENERAL,
    };
    return map[action?.toUpperCase()] ?? AgentAction.GENERAL;
  }

  private mapDomain(domain: string): AIDomain {
    const map: Record<string, AIDomain> = {
      LISTING: AIDomain.LISTING,
      BOOKING: AIDomain.BOOKING,
      REVIEW: AIDomain.REVIEW,
      GENERAL: AIDomain.GENERAL,
      PAYMENT: AIDomain.PAYMENT,
    };
    return map[domain?.toUpperCase()] ?? AIDomain.GENERAL;
  }

  private resolveDomainFromAction(action: AgentAction, currentDomain: AIDomain): AIDomain {
    const bookingActions: AgentAction[] = [
      AgentAction.CREATE_BOOKING,
      AgentAction.CANCEL_BOOKING,
      AgentAction.CONFIRM_BOOKING,
      AgentAction.COMPLETE_BOOKING,
      AgentAction.MODIFY_BOOKING,
      AgentAction.GET_BOOKING,
      AgentAction.GET_MY_BOOKINGS,
    ];
    if (bookingActions.includes(action)) return AIDomain.BOOKING;

    const listingActions: AgentAction[] = [
      AgentAction.OPTIMIZE_TITLE,
      AgentAction.OPTIMIZE_DESCRIPTION,
      AgentAction.SEO_ANALYSIS,
      AgentAction.SEARCH_LISTING,
      AgentAction.CHECK_AVAILABILITY,
      AgentAction.GET_LISTING,
    ];
    if (listingActions.includes(action)) return AIDomain.LISTING;

    return currentDomain;
  }
}
