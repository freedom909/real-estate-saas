//src/ai-platform/infrastructure/llm/openai.provider.ts
import { ILLMProvider } from "@/ai-platform/domain/interface/ILLMProvider";
import { TOKENS } from "@/shared/infra/tokens";
import OpenAI from "openai";
import { inject, injectable } from "tsyringe";

@injectable()
export class OpenAILLMProvider implements ILLMProvider {

  private client: OpenAI;

  constructor() {

    this.client = new OpenAI({
      apiKey:
        process.env.OPENAI_API_KEY
    });
  }

  async generateText(params: { prompt: string }): Promise<string> {

    const response =
      await this.client.chat.completions.create({

        model: "gpt-4o",

        messages: [
          {
            role: "user",
            content: params.prompt
          }
        ],

        temperature: 0.7
      });

    return (
      response.choices[0]?.message?.content ?? ""
    );
  }
}
