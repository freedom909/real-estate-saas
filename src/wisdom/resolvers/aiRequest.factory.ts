// src/wisdom/resolvers/aiRequest.factory.ts
// src/wisdom/request/ai-request.factory.ts is not exist
import crypto from "crypto";
import { AIContext, AIRequest } from "../contracts/ai-context";
import { sessionMemory } from "../memory/session-memory";
import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemorySessionStore } from "../memory/session/session-memory.store";



@injectable()
export class AIRequestFactory {
  constructor(
    @inject(WISDOM_TOKENS.memory.sessionStore)
    private sessionStore: MemorySessionStore,
  ) {
    console.log(
        "AIRequestFactory sessionStore",
        this.sessionStore
    );

  }
  // =====================================
  // GraphQL
  // =====================================

  create(
    source: "web" | "mobile" | "voice",
    payload: any
  ) {

    switch (source) {

      case "web":
        return this.fromGraphQL(payload);

      // case "mobile":
      //   return this.fromMobile(payload);

      // case "voice":
      //   return this.fromVoice(payload);
    }
  }

fromGraphQL(payload: any): AIRequest {

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

            resources: payload.resources,

            trace: {
                correlationId: crypto.randomUUID(),
            },
        },
    };
}


  // =====================================
  // Mobile
  // =====================================
  // buildMobile(payload: any): AIRequest {
  //   const memoryContext = buildMemoryContext(payload);
  //   const session = this.sessionStore.load(memoryContext);
  //   return {
  //     message: payload.message,
  //     context: {
  //       identity: {
  //         user: payload.identity.user,
  //         tenant: payload.identity.tenant,
  //       },

  //       runtime: {
  //         source: "mobile",
  //         locale: payload.runtime.locale,
  //         timezone: payload.runtime.timezone,
  //         sessionId: payload.runtime.session.id,
  //         device: {
  //           type: "mobile",
  //         },
  //         ui: {
  //           screen: payload.screen,
  //           component: payload.component,
  //         },
  //       },
  //       resources: {
  //         ...payload.resources ?? {},
  //         searchResults: session?.searchResults ?? {},
  //         bookingDraft: session?.bookingDraft ?? {},
  //         booking: session?.booking ?? {},
  //       },

  //       trace: {
  //         correlationId:
  //           crypto.randomUUID(),
  //       },
  //     },
  //   };
  // }

  // =====================================
  // Voice
  // =====================================

  // buildVoice(
  //   payload: any
  // ): AIRequest {
  //   const memoryContext = buildMemoryContext(payload);
  //   const session = this.sessionStore.load(memoryContext);
  //   return {
  //     message: payload.transcript,

  //     context: {
  //       identity: {
  //         user: {
  //           id: payload.userId,
  //         },

  //         tenant: payload.tenant,
  //       },

  //       runtime: {
  //         source: "voice",

  //         locale: payload.locale,
  //         timezone: payload.timezone,

  //         device: {
  //           type: "voice",
  //         },

  //         voice: {
  //           transcriptConfidence:
  //             payload.confidence,
  //         },
  //       },
  //       resources: {
  //         ...payload.resources ?? {},
  //         searchResults: session?.searchResults ?? {},
  //         bookingDraft: session?.bookingDraft ?? {},
  //         booking: session?.booking ?? {},
  //       },

  //       trace: {
  //         correlationId:
  //           crypto.randomUUID(),
  //       },
  //     },
  //   };
  // }
}
