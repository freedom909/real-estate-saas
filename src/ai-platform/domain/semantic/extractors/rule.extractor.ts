//

import { injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";
import { AIDomain } from "../types/ai.domain";


@injectable()
export class RuleExtractor {

  async extract(
    message: string
  ): Promise<SemanticContext> {
    
    const intents = [];
    const entities = [];

    const lower =message.toLowerCase();//       

    if (lower.includes("cancel")) {
      intents.push({
        name: "CANCEL_BOOKING",
        confidence: 0.95
      });
    }

    if (lower.includes("booking")) {
      entities.push({
        type: "bookingId",
        value: "BK-999",
        confidence: 0.91
      });
    }

    const confidence =
      intents.length
        ? 0.95
        : 0;

    return new SemanticContext(// 5 個の引数が必要ですが、4 個指定されました。
      message,
      intents,
      entities,
      confidence,
      AIDomain.RULE,
    );
  }
}

//