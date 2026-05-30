//

import { injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";


@injectable()
export class RuleExtractor {

  async extract(
    message: string
  ): Promise<SemanticContext> {
    
    const intents = [];
    const entities = [];

    const lower =
      message.toLowerCase();//         "TypeError: Cannot read properties of undefined (reading 'toLowerCase')"

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

    return new SemanticContext(
      message,
      intents,
      entities,
      confidence
    );
  }
}

//