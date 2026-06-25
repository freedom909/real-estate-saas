// src/wisdom/tools/IOpenAI.tool.ts
export interface IOpenAITool {
  generateText(input: {
    prompt: string;
  }): Promise<string>;
}