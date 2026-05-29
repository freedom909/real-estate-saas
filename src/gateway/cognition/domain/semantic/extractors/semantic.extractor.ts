import { injectable } from "tsyringe";

import { ISemanticExtractor }
  from "../types/i-semantic.extractor";
import { SemanticContext } from "../semantic-context";

@injectable()
export class SemanticExtractor
  implements ISemanticExtractor {

  public async extract(
    message: string
  ): Promise<SemanticContext> {

    const lower =
      message.toLowerCase();

    const intents = [];

    const entities = [];

    if (lower.includes("cancel")) {
      intents.push({
        name: "CANCEL",
        confidence: 0.95
      });
    }

    if (lower.includes("refund")) {
      intents.push({
        name: "REFUND",
        confidence: 0.95
      });
    }

    if (lower.includes("optimize")) {
      intents.push({
        name: "OPTIMIZE",
        confidence: 0.92
      });
    }

    if (lower.includes("booking")) {
      entities.push({
        type: "bookingId",
        value: "BK-999",
        confidence: 0.91
      });
    }

    if (lower.includes("title")) {
      entities.push({
        type: "targetField",
        value: "title",
        confidence: 0.90
      });
    }

    return new SemanticContext(
      message,
      intents,
      entities,
      0.95
    );
  }
}