//

import { TOKENS } from "@/shared/infra/tokens";
import { container } from "tsyringe";
import { TOKENS_LLM } from "./llm.token";
import { OpenAILLMProvider } from "@/ai-platform/infrastructure/llm/openai.provider";
import { LLMRouter } from "@/ai-platform/infrastructure/llm/llm.router";

export function lllmRegister(){
    container.register(TOKENS_LLM.openai,{
        useClass: OpenAILLMProvider,  
    }),

    container.register(TOKENS_LLM.router,{
        useClass: LLMRouter,
    })

}