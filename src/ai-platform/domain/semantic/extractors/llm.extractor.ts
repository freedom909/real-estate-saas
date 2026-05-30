// 

import { SemanticContext } from "../semantic-context";

export default class LLMExtractor {

 public async extract(message: string): Promise<SemanticContext> {
    // In a real implementation, this would call an LLM API (OpenAI, Anthropic, etc.)
    
    // For now, we return an empty structure to be populated by the LLM logic
    const intents: any[] = [];
    const entities: any[] = [];
    const confidence=0
    return new SemanticContext(message,intents,entities,confidence);
  }
}
