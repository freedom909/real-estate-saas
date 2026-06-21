// ai-request.factory.ts

import { AIRequest } from "@/ai-platform/context/types/context/ai.context";



export class AIRequestFactory {
  static fromGraphQL(
    input: any,
    context: any
  ): AIRequest {

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
