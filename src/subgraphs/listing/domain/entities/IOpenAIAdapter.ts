// FILE: src/subgraphs/listing/domain/entities/IOpenAIAdapter.ts
export interface IOpenAIAdapter {
  generateText(input: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string>;
}