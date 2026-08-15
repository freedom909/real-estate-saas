// src/wisdom/conversation/reference/reference.resolver.ts

import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { ListingReferenceResolver } from "@/wisdom/reference/IlistingReference-resolver";
import { inject, injectable } from "tsyringe";
import { ConversationReferenceResolver } from "../conversationReferences.resolver";
import { EntityType, SemanticContext } from "@/wisdom/semantic/semantic-context";
import { AIContext } from "@/wisdom/contracts/ai-context";

@injectable()
export class ReferenceResolver {

  constructor(
    @inject(WISDOM_TOKENS.reference.listingReferenceResolver)
    private listingReferenceResolver: ListingReferenceResolver,

    @inject(WISDOM_TOKENS.reference.conversationReferenceResolver)
    private conversationReferenceResolver: ConversationReferenceResolver,
  ) {}

  async resolve(
    semantic: SemanticContext,
    context: AIContext,
  ): Promise<SemanticContext> {

    // ① Conversation reference
    const conversationReference =
      await this.conversationReferenceResolver.resolve(
        semantic,
        context,
        this.inferTargetEntityType(semantic),
      );

    if (conversationReference) {
      semantic.entities.push({
        // Property 'entityType' does not exist on type 'ReferenceResolver'.
        //Property 'entityId' does not exist on type 'ReferenceResolver'.
        //Property 'confidence' does not exist on type 'ReferenceResolver'.
        type: conversationReference.entityType,
        value: conversationReference.entityId,
        confidence: conversationReference.confidence,
      });

      return semantic;
    }

    // ② Listing reference
    return this.listingReferenceResolver.resolve(
      semantic,
      context,
    );
  }

  private inferTargetEntityType(
    semantic: SemanticContext,
  ): EntityType {

    switch (semantic.action?.type) {

      case "CREATE_BOOKING":
      case "GET_LISTING":
        return EntityType.LISTING;

      case "CANCEL_BOOKING":
      case "GET_BOOKING":
      case "CONFIRM_BOOKING":
      case "COMPLETE_BOOKING":
        return EntityType.BOOKING;

      default:
        return EntityType.BOOKING;
    }
  }
}