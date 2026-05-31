export interface SemanticIntent {
  name: string;
  confidence: number;  
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export class 
SemanticContext {
  constructor(
    public readonly rawInput: string,
    public readonly intents: SemanticIntent[],
    public readonly entities:  Entity[],
    public readonly confidence: number
  ) {}

  public hasIntent(intent: string): boolean {
    return this.intents.some(i => i.name === intent);
  }
}