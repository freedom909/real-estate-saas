// FILE: src/subgraphs/listing/infrastructure/ai/OpenAIAdapter.ts

import { injectable } from "tsyringe";
import fetch from "node-fetch";

@injectable()
export class OpenAIAdapter {
  async generateText(input: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct",
        prompt: input.prompt,
        temperature: input.temperature ?? 0.7,
        max_tokens: input.maxTokens ?? 150,
      }),
    });

    if (!res.ok) {
      throw new Error("OpenAI error");
    }

    const data: any = await res.json();
    return data.choices?.[0]?.text?.trim() || "";
  }
}