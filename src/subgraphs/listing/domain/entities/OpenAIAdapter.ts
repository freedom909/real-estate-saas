import { injectable } from "tsyringe";
import fetch from "node-fetch";

interface OpenAICompletionResponse {
  choices: Array<{
    text: string;
  }>;
}

@injectable()
export class OpenAIAdapter {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1/completions";
    this.apiKey = process.env.OPENAI_API_KEY || ""; // Ensure this is set in your environment
    if (!this.apiKey) {
      console.warn("OPENAI_API_KEY is not set. OpenAIAdapter will not function correctly.");
    }
  }

  async generateText(prompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-instruct", // Or another suitable model
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("OpenAI API error:", errorBody);
      throw new Error(`Failed to generate text from OpenAI: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenAICompletionResponse;
    return data.choices[0]?.text.trim() || "";
  }
}