import { AIDomain } from "./types/ai.domain";


export interface SemanticAction {
  name: string;
  confidence: number;
}

export interface Entity {
  type: string; // this should be the an enum type which is defined in the domain
  value: string;// if it is an object
}

export class SemanticContext {
  constructor(
    public readonly rawInput: string, 
    public readonly entities: Entity[],// 实体
    public readonly action: SemanticAction | null,// 动作
    public readonly confidence: number,
    public readonly domain: AIDomain,
    public readonly isRuleMatched: boolean = false, // ⭐新增
  ) {}


  hasAction(action: string): boolean {
    return this.action !== null && this.action.name === action;
  }
  
  getTopAction(): string | null {
    return this.action !== null
      ? this.action.name
      : null;
  }

  hasDomain(
    domain: AIDomain
  ): boolean {
    return this.domain === domain;
  }
}