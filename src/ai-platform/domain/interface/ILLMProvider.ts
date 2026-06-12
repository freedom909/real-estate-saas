//src/ai-platform/domain/interface/ILLMProvider.ts

export interface ILLMProvider {
  generateText(params: { prompt: string }): Promise<string>;
}