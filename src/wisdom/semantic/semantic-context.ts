// src/wisdom/semantic/semantic-context.ts

import { AIDomain } from "../shared/enums/domain.enum";
import { AgentAction } from "../shared/enums/action.enum";
import { EntityType } from "../shared/enums/entity-type.enum";
import { SemanticEntity } from "./semantic.entity";

export { AgentAction } from "../shared/enums/action.enum";
export { EntityType } from "../shared/enums/entity-type.enum";
export { AIDomain } from "../shared/enums/domain.enum";

export interface SemanticAction {
  type: AgentAction;
  confidence: number;
}

export class SemanticContext {
  constructor(
    public readonly rawInput: string,
    public readonly entities: SemanticEntity[],
    public readonly action: SemanticAction | null,
    public readonly confidence: number,
    public readonly domain: AIDomain,
    public readonly isRuleMatched: boolean = false,
  ) {}

  hasAction(action: AgentAction): boolean {
    return this.action !== null && this.action.type === action;
  }

  getTopAction(): string | null {
    return this.action !== null ? this.action.type : null;
  }

  hasDomain(domain: AIDomain): boolean {
    return this.domain === domain;
  }
}
