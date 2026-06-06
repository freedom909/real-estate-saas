//

import { injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";
import { AIDomain } from "../types/ai.domain";

@injectable()
export class RuleExtractor {

  async extract(
    message: string
  ): Promise<SemanticContext> {

    const lower =
      message.toLowerCase();

    if (lower.includes("cancel")) {
      return new SemanticContext(
        message,
        [{
          name: "CANCEL_BOOKING",
          confidence: 0.99
        }],
        [],
        0.99,
        AIDomain.BOOKING,
        true
      );
    }

    const entities = [];

    const listingMatch =
      message.match(
        /listingid\s*=\s*([a-zA-Z0-9-]+)/i
      );

    if (listingMatch) {
      entities.push({
        type: "listing_id",
        value: listingMatch[1]
      });
    }

    if (lower.includes("title")) {
      return new SemanticContext(
        message,
        [{
          name: "OPTIMIZE_TITLE",
          confidence: 0.99
        }],
        entities,
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    return new SemanticContext(
      message,
      [],
      [],
      0,
      AIDomain.UNKNOWN,
      false
    );
  }
}

