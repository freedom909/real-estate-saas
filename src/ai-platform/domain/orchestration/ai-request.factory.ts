// ai-request.factory.ts

import { AIRequest } from "@/ai-platform/context/types/context/aiContext";



export class AIRequestFactory {
  static fromGraphQL(
    input: any,
    context: any
  ): AIRequest {

    return {
      message: input.message,

      context: {

        identity: {
          user: context.user,

          tenant: context.tenant,
        },

        runtime: {
          source: "web",

          locale: context.locale,

          timezone: context.timezone,

          sessionId:
            context.sessionId,
        },

        resources: {
          listingId:
            input.listingId,

          bookingId:
            input.bookingId,
        },

        trace: {
          correlationId:
            crypto.randomUUID(),
        },
      },
    };
  }
}