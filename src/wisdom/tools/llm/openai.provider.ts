//src/wisdom/tools/llm/openai.provider.ts
import OpenAI from "openai";
import { injectable } from "tsyringe";
import { ILLMProvider } from "./ILLMProvider";

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
