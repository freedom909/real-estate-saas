//
import { inject, injectable } from "tsyringe";
import { SemanticContext } from "../semantic/semantic-context";
import { TOKENS_AI_ADAPTER } from "@/ai-platform/container/tokens/ai.adapter";
import { OpenAIAdapter } from "@/ai-platform/infrastructure/adapters/openai.adapter";



@injectable()
export class GeneralAgent {

  constructor(
    @inject(TOKENS_AI_ADAPTER.aiAdapter)
    private ai: OpenAIAdapter
  ) {}



  async execute(
    semantic: SemanticContext
  ) {

    console.log(
      "GeneralAgent.execute"
    );

    console.log(
      "semantic.rawInput",
      semantic.rawInput
    );

    const reply =
      await this.ai.generateText({
        prompt:
          semantic.rawInput
      });

    console.log(
      "GPT reply:",
      reply
    );

    return {
      reply
    };
  }

}