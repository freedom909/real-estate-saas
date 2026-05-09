// FILE: src/subgraphs/listing/infrastructure/ai/OpenAI.adapter.ts

import { injectable } from "tsyringe";

export interface GenerateTextOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

@injectable()
export class OpenAIAdapter {
  async generateText(input: string | GenerateTextOptions): Promise<string> {
    const options = typeof input === "string" ? { prompt: input } : input;

    const res = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct",
        prompt: options.prompt,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 150,
      }),
    });

    if (!res.ok) {
      throw new Error("OpenAI error");
    }

    const data: any = await res.json();
    return data.choices?.[0]?.text?.trim() || "";
  }
}
