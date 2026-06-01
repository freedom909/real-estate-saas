//src/subgraphs/listing/application/ai/services/OpenAIService.ts
import { OpenAI } from "openai";
import { GenerateTitleResult } from "../../contracts/ai/generateTitleResult";

export interface ILLMService {
  generate(prompt: string): Promise<string>
}



export class OpenAIService {

  private client: OpenAI;

  constructor() {

    this.client = new OpenAI({
      apiKey:
        process.env.OPENAI_API_KEY,
    });
  }

  async generateTitle(prompt: string): Promise<GenerateTitleResult>{

    const response =
      await this.client
        .chat.completions.create({

          model: "gpt-4.1-mini",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.7,
        });

    return {
      rawTitle: response
      .choices[0]
      .message
      .content ?? "",
      title: response
        .choices[0]
        .message
        .content ?? "",
    }
  }
}