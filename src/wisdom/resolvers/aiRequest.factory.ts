// src/wisdom/resolvers/aiRequest.factory.ts
// src/wisdom/request/ai-request.factory.ts is not exist
import crypto from "crypto";
import { AIRequest } from "../contracts/ai-context";
import { sessionMemory } from "../memory/session-memory";

export class AIRequestFactory {

  // =====================================
  // GraphQL
  // =====================================

  static fromGraphQL(input: any, context: any): AIRequest {
    const sessionId =
    context.user?.sessionId;
    console.log(
  "RAW CONTEXT USER",
  context.user
);
    console.log(
  "SESSION ID FROM REQUEST",
  sessionId
);


    console.log(
  "MEMORY BEFORE REQUEST",
  sessionMemory
);
    // Map getUserFromToken result { userId, email, role } → IdentityContext.user { id, email, role }
    const rawUser = context.user;
    const user = rawUser ? {
      id: rawUser.userId || rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
    } : undefined;

const userId = user?.id ?? sessionId ?? "anonymous";

const memoryKey =
  user?.id ?? "anonymous";
  const memory =  sessionMemory.get(memoryKey) || {};
console.log("MEMORY GET CALLED", memory);
  console.log(
  "MEMORY KEY",
  memoryKey
);
console.log(
  "MEMORY VALUE",
  sessionMemory.get(memoryKey)
);
    
    return {
      message: input.message,

      context: {
        identity: {
          user,
          tenant: context.tenant,
        },

        runtime: {
          source: "web",

          locale: context.locale,
          timezone: context.timezone,

          sessionId: context.sessionId,
          device: {
            type: "desktop",
          },
        },
        resources: {
          listingId: input.listingId,
          bookingId: input.bookingId,
          reviewId: input.reviewId,
            searchResults:
              memory?.searchResults,
            bookingDraft:
              memory?.bookingDraft,    
        },

        trace: {
          correlationId:
            crypto.randomUUID(),
        },
      },
    };
  }

  // =====================================
  // Mobile
  // =====================================

  static fromMobile(payload: any): AIRequest {

    return {
      message: payload.message,
      context: {
        identity: {
          user: payload.user,
          tenant: payload.tenant,
        },

        runtime: {
          source: "mobile",
          locale: payload.locale,
          timezone: payload.timezone,
          sessionId: payload.sessionId,
          device: {
            type: "mobile",
          },
          ui: {
            screen: payload.screen,
            component: payload.component,
          },
        },
        resources:
          payload.resources ?? {},

        trace: {
          correlationId:
            crypto.randomUUID(),
        },
      },
    };
  }

  // =====================================
  // Voice
  // =====================================

  static fromVoice(
    payload: any
  ): AIRequest {

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

          device: {
            type: "voice",
          },

          voice: {
            transcriptConfidence:
              payload.confidence,
          },
        },
        resources:
          payload.resources ?? {},

        trace: {
          correlationId:
            crypto.randomUUID(),
        },
      },
    };
  }
}
