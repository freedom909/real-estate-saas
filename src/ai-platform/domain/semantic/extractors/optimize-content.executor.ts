// src/ai-platform/cognition/domain/agents/listing/executors/optimize-content.executor.ts
import { injectable } from "tsyringe";
import { IExecutor } from "../../planning/types/i-facet.resolver";
import { SemanticContext } from "../semantic-context";


@injectable()
export class OptimizeContentExecutor {

  async execute(
    semantic: SemanticContext
  ) {

    const listingId =
      semantic.entities.find(
        e => e.type === "listing_id"
      )?.value;

    const targetField =
      "title";

    console.log(
      `Executing OptimizeContent for listingId:
       ${listingId},
       targetField:
       ${targetField}`
    );

    return {
      reply:
        `Optimize ${targetField}
         for listing ${listingId}`
    };
  }
}