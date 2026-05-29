export interface SemanticIntent {
  name: string;
  confidence: number;
}

export interface SemanticEntity {
  type: string;
  value: string;
}

export class SemanticContext {
  constructor(
    public readonly rawInput: string,
    public readonly intents: string[],
    public readonly entities: Record<string, any>,
    public readonly confidence: number
  ) {}

  public hasIntent(intent: string): boolean {
    return this.intents.includes(intent);
  }
}