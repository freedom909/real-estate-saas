// security/infrastructure/ai/gemini.client.ts

import axios from "axios";

export class GeminiClient {
  constructor(private apiKey: string) {}

  async analyze(prompt: string) {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: this.apiKey }
      }
    );

    return res.data;
  }
}