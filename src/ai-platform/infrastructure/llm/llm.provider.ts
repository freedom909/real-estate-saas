//src/ai-platform/infrastructure/llm/llm.provider.ts

import { inject, injectable } from "tsyringe";  

import { ILLMProvider } from "@/ai-platform/domain/interface/ILLMProvider";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";


export enum LLMProviderType {
    OPENAI = "openai",
    DEEPSEEK = "deepseek",
    GEMINI = "gemini",
    HUGGINGFACE = "huggingface",
    ANTHROPIC = "anthropic"
}

@injectable()
export class LLMProvider implements ILLMProvider {
    constructor(
        @inject(TOKENS_AI.usecase.llmProvider) 
        private llmProvider: ILLMProvider,
        
    ) {}

    /**
     * Generates text based on the configured LLM provider.
     * Note: Signature adjusted to match OpenAIAdapter and UseCase requirements { prompt: string }
     */
    async generateText(params: { prompt: string }): Promise<string> {
        const selectedProvider = process.env.LLM_PROVIDER || LLMProviderType.OPENAI;

        switch (selectedProvider) {
            case LLMProviderType.OPENAI:
                return this.llmProvider.generateText(params);

            case LLMProviderType.DEEPSEEK:
                // TODO: Implement DeepSeek integration
                throw new Error("DeepSeek provider not implemented yet.");

            default:
                // Fallback to OpenAI
                return this.llmProvider.generateText(params);
        }
    }
}