//src

export const TOKENS_LLM = {
    openai: Symbol.for("OpenAILLMProvider"),
    deepseek: Symbol.for("DeepSeekLLMProvider"),
    gemini: Symbol.for("GeminiLLMProvider"),
    huggingface: Symbol.for("HuggingFaceLLMProvider"),

    router: Symbol.for("LLMRouter")
  };
