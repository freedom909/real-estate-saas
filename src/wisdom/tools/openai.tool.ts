// src/infrastructure/adapters/openai.adapter.ts
import { injectable } from "tsyringe";
import OpenAI from "openai";
import { IOpenAITool } from "./IOpenAI.tool";


/**
 * Infrastructure adapter for interacting with OpenAI API.
 */
@injectable()
export class OpenAITool implements IOpenAITool {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable.");
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateText(params: { prompt: string }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o", // Or your preferred model version
      messages: [
        { role: "user", content: params.prompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "";
  }
}
