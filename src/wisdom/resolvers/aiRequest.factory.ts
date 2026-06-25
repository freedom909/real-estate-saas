// src/ai-platform/factory/aiRequest.factory.ts

import crypto from "crypto";
import { AIRequest } from "../contracts/ai-context";



export class AIRequestFactory {

  // =====================================
  // GraphQL
  // =====================================

  static fromGraphQL(input: any, context: any): AIRequest {

    // Map getUserFromToken result { userId, email, role } → IdentityContext.user { id, email, role }
    const rawUser = context.user;
    const user = rawUser ? {
      id: rawUser.userId || rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
    } : undefined;

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
