export interface ILLMProvider {
  generateText(params: { prompt: string }): Promise<string>;
}
