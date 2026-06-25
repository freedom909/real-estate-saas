// infrastructure/llm/llm.router.ts


import {
  inject,
  injectable
} from "tsyringe";
import { ILLMProvider } from "./ILLMProvider";
import { TOKENS_LLM } from "./llm.tokens";



@injectable()
export class LLMRouter implements ILLMProvider {

  constructor(

    @inject(TOKENS_LLM.openai)
    private openai: ILLMProvider,

  ) {}

  async generateText(
    params: { prompt: string }
  ): Promise<string> {

    const provider = process.env.LLM_PROVIDER ?? "openai";

    switch (provider) {

      case "openai":
        return this.openai.generateText(
          params
        );

    //   case "deepseek":
    //     return this.deepseek.generateText(
    //       params
    //     );

    //   case gemini":
    //     return this.gemini.generateText(
    //       params
    //     );  

      default:
        return this.openai.generateText(
          params
        );
    }
  }
}
