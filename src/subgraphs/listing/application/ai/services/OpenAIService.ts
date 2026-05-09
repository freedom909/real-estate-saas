//src/subgraphs/listing/application/ai/services/OpenAIService.ts
import { OpenAI } from "openai";

export interface ILLMService {
  generate(prompt: string): Promise<string>
}

export class OpenAIService {
    private client=new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY || "",
    });

    async generate(prompt: string) {
        console.log(prompt);

        const response = await this.client.chat.completions.create({
           model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
        return response.choices[0].message.content;
    }
}