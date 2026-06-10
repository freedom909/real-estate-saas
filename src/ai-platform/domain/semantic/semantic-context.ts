import { AIDomain } from "./types/ai.domain";


export interface SemanticAction {
  type: AgentAction;
  confidence: number;
}

export enum AgentAction {
  OPTIMIZE_TITLE = "OPTIMIZE_TITLE",
  OPTIMIZE_PRICE = "OPTIMIZE_PRICE",
  OPTIMIZE_CATEGORY = "OPTIMIZE_CATEGORY",
  OPTIMIZE_LISTING = "OPTIMIZE_LISTING",
  OPTIMIZE_LOCATION = "OPTIMIZE_LOCATION",
  OPTIMIZE_AMENITY = "OPTIMIZE_AMENITY",
  
  OPTIMIZE_DESCRIPTION = "OPTIMIZE_DESCRIPTION",
    SEO_ANALYSIS ="SEO_ANALYSIS",
    CANCEL_BOOKING = "CANCEL_BOOKING",
  CREATE_BOOKING = "CREATE_BOOKING",

}

export interface Entity {
  type: EntityType; // this should be the an enum type which is defined in the domain
  value: string;// if it is an object
}

export enum EntityType {

  LISTING_ID =
    "LISTING_ID",

  BOOKING_ID =
    "BOOKING_ID",
  CHECK_IN =
    "check_in",

  CHECK_OUT =
    "check_out",
 

  REVIEW_ID =
    "REVIEW_ID",

  USER_ID =
    "USER_ID",

  TENANT_ID =
    "TENANT_ID",
}
export class SemanticContext {
  constructor(
    public readonly rawInput: string, 
    public readonly entities: Entity[],// 实体
    public readonly action: SemanticAction | null,// 动作
    public readonly confidence: number,
    public readonly domain: AIDomain,
    public readonly isRuleMatched: boolean = false, // 
  ) {}


  hasAction(action: AgentAction): boolean {
    return this.action !== null && this.action.type === action;
  }
  
  getTopAction(): string | null {
    return this.action !== null
      ? this.action.type
      : null;
  }

  hasDomain(
    domain: AIDomain
  ): boolean {
    return this.domain === domain;
  }
}