// src/ai-platform/domain/routing/routing.service.ts

import { injectable } from "tsyringe";
import { SemanticContext } from "../../semantic/semantic-context";


@injectable()
export class RoutingService {

  route(
    semantic: SemanticContext
  ): string {

    const topIntent =
      semantic.intents[0];

    if (!topIntent) {
      return "GeneralAgent";
    }

    switch (topIntent) {

      case "CANCEL_BOOKING":
        return "BookingAgent";

      case "OPTIMIZE_LISTING":
        return "ListingAgent";

      case "SECURITY_ALERT":
        return "SecurityAgent";

      default:
        return "GeneralAgent";
    }
  }
}