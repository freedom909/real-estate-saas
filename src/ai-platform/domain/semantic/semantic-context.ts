import { AIDomain } from "./types/ai.domain";


export interface SemanticIntent {
  name: string;
  confidence: number;
}

export interface Entity {
  type: string;
  value: string;
}

export class SemanticContext {

  constructor(
    public readonly rawInput: string,
    public readonly intents: SemanticIntent[],
    public readonly entities: Entity[],
    public readonly confidence: number,
    public readonly domain: AIDomain,
  ) {}

  hasIntent(intent: string): boolean {
    return this.intents.some(
      i => i.name === intent
    );
  }

  getTopIntent(): string | null {
    return this.intents.length
      ? this.intents[0].name
      : null;
  }

  hasDomain(
    domain: AIDomain
  ): boolean {
    return this.domain === domain;
  }
}