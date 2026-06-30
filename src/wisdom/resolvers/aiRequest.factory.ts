// src/wisdom/resolvers/aiRequest.factory.ts

import crypto from "crypto";
import { inject, injectable } from "tsyringe";

import { AIRequest } from "../contracts/ai-context";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "../memory/session/session-memory.store";
import { MemoryContext } from "../memory/type/memory-context";

@injectable()
export class AIRequestFactory {
  constructor(
    @inject(WISDOM_TOKENS.memory.sessionStore)
    private readonly sessionStore: MemorySessionStore,
  ) {}

  // ====================================================
  // Factory
  // ====================================================

  create(
    source: "web" | "mobile" | "voice",
    payload: any,
  ) {
    switch (source) {
      case "web":
        return this.fromGraphQL(payload);

      case "mobile":
        return this.fromMobile(payload);

      case "voice":
        return this.fromVoice(payload);

      default:
        throw new Error(`Unsupported source: ${source}`);
    }
  }

  // ====================================================
  // GraphQL
  // ====================================================

  private fromGraphQL(payload: any): AIRequest {
    const memoryContext: MemoryContext = {
      userId: payload.identity.user.userId,
      sessionId: payload.runtime.session.id,
      session: {},
    };

    const session = this.sessionStore.load(memoryContext);

    console.log("Loaded session:", session);

    return {
      message: payload.message,

      context: {
        identity: {
          user: {
            id: payload.identity.user.userId,
            email: payload.identity.user.email,
            role: payload.identity.user.role,
          },
          tenant: payload.identity.tenant,
        },

        runtime: {
          source: "web",
          locale: payload.runtime.locale,
          timezone: payload.runtime.timezone,
          sessionId: payload.runtime.session.id,
        },

        resources: {
          ...(payload.resources ?? {}),
          searchResults: session?.searchResults ?? [],
          bookingDraft: session?.bookingDraft ?? {},
          booking: session?.booking ?? {},
        },

        trace: {
          correlationId: crypto.randomUUID(),
        },
      },
    };
  }

  // ====================================================
  // Mobile
  // ====================================================

  private fromMobile(payload: any): AIRequest {
    const memoryContext: MemoryContext = {
      userId: payload.identity.user.userId,
      sessionId: payload.runtime.session.id,
      session: {},
    };

    const session = this.sessionStore.load(memoryContext);

    return {
      message: payload.message,

      context: {
        identity: {
          user: payload.identity.user,
          tenant: payload.identity.tenant,
        },

        runtime: {
          source: "mobile",
          locale: payload.runtime.locale,
          timezone: payload.runtime.timezone,
          sessionId: payload.runtime.session.id,

          device: {
            type: "mobile",
          },

          ui: {
            screen: payload.screen,
            component: payload.component,
          },
        },

        resources: {
          ...(payload.resources ?? {}),
          searchResults: session?.searchResults ?? [],
          bookingDraft: session?.bookingDraft ?? {},
          booking: session?.booking ?? {},
        },

        trace: {
          correlationId: crypto.randomUUID(),
        },
      },
    };
  }

  // ====================================================
  // Voice
  // ====================================================

  private fromVoice(payload: any): AIRequest {
    const memoryContext: MemoryContext = {
      userId: payload.identity.user.userId,
      sessionId: payload.runtime.session.id,
      session: {},
    };

    const session = this.sessionStore.load(memoryContext);

    console.log("Loaded session:", session);

    return {
      message: payload.transcript,

      context: {
        identity: {
          user: {
            id: payload.userId,
          },
          tenant: payload.tenant,
        },

        runtime: {
          source: "voice",
          locale: payload.locale,
          timezone: payload.timezone,

          sessionId: payload.runtime.session.id,

          device: {
            type: "voice",
          },

          voice: {
            transcriptConfidence: payload.confidence,
          },
        },

        resources: {
          ...(payload.resources ?? {}),
          searchResults: session?.searchResults ?? [],
          bookingDraft: session?.bookingDraft ?? {},
          booking: session?.booking ?? {},
        },

        trace: {
          correlationId: crypto.randomUUID(),
        },
      },
    };
  }
}