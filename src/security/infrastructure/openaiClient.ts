// infrastructure/ai/OpenaiClient.ts
import axios from "axios";

class OpenaiClient {
  private apiKey = process.env.OPENAI_API_KEY;

  async analyze(prompt: string, model: string = "openai-3.5-turbo"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables.");
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    return response.data;
  }
}

export default OpenaiClient;