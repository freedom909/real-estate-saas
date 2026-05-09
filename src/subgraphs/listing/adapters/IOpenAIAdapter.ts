// src/subgraphs/listing/adapters/IOpenAIAdapter.ts
export interface IOpenAIAdapter {
  generateText(input: {
    prompt: string;
  }): Promise<string>;
}