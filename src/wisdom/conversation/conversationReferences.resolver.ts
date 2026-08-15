// src/wisdom/conversation/reference/conversation-reference.resolver.ts

import { inject, injectable } from "tsyringe";

import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import {
  EntityType,
  SemanticContext,
} from "@/wisdom/semantic/semantic-context";

import {
  ReferenceType,
  ResolvedReference,
} from "./reference/resolved-reference";

@injectable()
export class ConversationReferenceResolver {

  constructor(
    @inject(WISDOM_TOKENS.memory.sessionStore)
    private sessionStore: MemorySessionStore,
  ) {}

async resolve(
  semantic: SemanticContext,
  context: AIContext,
  targetEntityType: EntityType,
): Promise<ResolvedReference | null> {

  const reference =
    this.extractReference(semantic);

  if (!reference) {
    return null;
  }

  const sessionId = context.runtime.sessionId;//
// Property 'sessionId' does not exist on type 'IdentityContext'.
  if (!sessionId) {
    return null;
  }

  const state =
    this.sessionStore.get(sessionId);

  if (!state) {
    return null;
  }

  switch (reference.referenceType) {

    case ReferenceType.CURRENT:
      return this.resolveCurrent(
        state,
        targetEntityType,
      );

    case ReferenceType.LAST:
    case ReferenceType.PREVIOUS:
      return this.resolveLast(
        state,
        targetEntityType,
      );

    default:
      return null;
  }
}

  private extractReference(
    semantic: SemanticContext,
  ): {
    referenceType: ReferenceType;
  } | null {

    const entity = semantic.entities.find(
      e => e.type === EntityType.REFERENCE,  
    );

    if (!entity) {
      return null;
    }

    return entity.value as {
      referenceType: ReferenceType;
    };
  }

  private resolveCurrent(
    state: any,
    targetEntityType: EntityType,
  ): ResolvedReference | null {

    const focus = state.currentFocus;

    if (!focus) {
      return null;
    }

    if (focus.entityType !== targetEntityType) {
      return null;
    }

    return {
      entityType: focus.entityType,
      entityId: focus.entityId,
      source: ReferenceType.CURRENT,
      confidence: 0.98,
    };
  }

  private resolveLast(
    state: any,
    targetEntityType: EntityType,
  ): ResolvedReference | null {

    const entity = state.recentEntities.find(
      (item: any) =>
        item.entityType === targetEntityType,
    );

    if (!entity) {
      return null;
    }

    return {
      entityType: entity.entityType,
      entityId: entity.entityId,
      source: ReferenceType.LAST,
      confidence: 0.95,
    };
  }
}