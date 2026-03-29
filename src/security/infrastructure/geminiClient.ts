// infrastructure/ai/geminiClient.ts

 class GeminiClient {
  async analyze(prompt: string): Promise<string> {
    // 👉 这里接 Google Gemini API
    return JSON.stringify({
      riskScore: Math.random(),
      reason: "AI simulated"
    });
  }
}

export default GeminiClient;