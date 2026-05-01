// infrastructure/ai/geminiClient.ts
import axios from "axios";

class GeminiClient {
  private apiKey = process.env.GEMINI_API_KEY;

  async analyze(prompt: string, model: string = "gemini-pro"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
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

export default GeminiClient;