//

import { injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";
import { AIDomain } from "../types/ai.domain";
import { AIRequest } from "../../types/context/aiContext";

@injectable()
export class RuleExtractor {

  async extract( 
    request: AIRequest // request seems to have no its use
  ): Promise<SemanticContext> {
    const message = request.message;
    
    console.log(
      "RuleExtractor message:",
      message,
    );
    const lower = message.toLowerCase();

    if (lower.includes("cancel")) {
      return new SemanticContext(
        message,      
        [],
        null,
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
        entities,
        {
          name: "OPTIMIZE_TITLE",
          confidence: 0.99
        },
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    return new SemanticContext(
      message,
      [],
      null,
      0,
      AIDomain.UNKNOWN,
      false
    );
  }
}

