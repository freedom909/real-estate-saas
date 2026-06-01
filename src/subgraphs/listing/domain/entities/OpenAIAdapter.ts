import { injectable } from "tsyringe";
import fetch from "node-fetch";
import { IOpenAIAdapter } from "../../adapters/IOpenAIAdapter";

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@injectable()
export class OpenAIAdapter implements IOpenAIAdapter {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl =
      process.env.OPENAI_API_URL ||
      "https://api.openai.com/v1/chat/completions";

    this.apiKey = process.env.OPENAI_API_KEY || "";

    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY is missing");
    }
  }

  async generateText(input: {
    prompt: string;
  }): Promise<string> {
    const { prompt } = input;

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant specialized in Airbnb listing optimization.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      console.error("OpenAI API error:", errorBody);

      throw new Error("OpenAI error");
    }

    const data =
      (await response.json()) as OpenAIChatResponse;

    return (
      data.choices?.[0]?.message?.content?.trim() || ""
    );
  }
}