// src/wisdom/agents/general.agent.ts

import { inject, injectable } from "tsyringe";
import { IDomainAgent } from "../contracts/agent";
import { SemanticContext } from "../semantic/semantic-context";
import { AIContext } from "../contracts/ai-context";
import { WisdomResponse } from "../contracts/response";
import { AIDomain } from "../shared/enums/domain.enum";
import { OpenAITool} from "@/wisdom/tools/openai.tool";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class GeneralAgent implements IDomainAgent {
  constructor(
    @inject(TOKENS_AI.OpenAITool)
    private ai: OpenAITool,
  ) {}

  async execute(semantic: SemanticContext, _context: AIContext): Promise<WisdomResponse> {
    const prompt = `
You are an AI assistant for a minshuku (民宿) booking platform.
You MUST respond in Japanese (日本語).

The user said: "${semantic.rawInput}"

親切でフレンドリーな日本語で返答してください。ユーザーの意図が不明な場合は、
確認の質問をしてください。予約や物件操作を行いたい場合は、
利用可能なアクションを案内してください。

利用可能なアクション:
- 予約の作成、キャンセル、確定、完了、確認
- 物件のタイトル・説明・SEOの最適化
- 物件詳細の確認

簡潔に返答してください。
`;

    const response = await this.ai.generateText({ prompt });
    const reply = typeof response === "string" ? response : JSON.stringify(response);

    return {
      success: true,
      domain: AIDomain.GENERAL,
      primaryAction: { name: "GENERAL", confidence: semantic.confidence ?? 0 },
      summary: reply,
      artifacts: [],
    };
  }
}
