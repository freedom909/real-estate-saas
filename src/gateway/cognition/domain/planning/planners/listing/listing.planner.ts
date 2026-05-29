// src/gateway/cognition/domain/planning/planners/listing.planner.ts
import { injectable } from "tsyringe";
import { SemanticContext } from "../../../semantic/semantic-context";
import { Task } from "../task";
import { AIDomain, CapabilityType } from "../../types/enums";


@injectable()
export class ListingPlanner {
  canHandle(context: SemanticContext): boolean {
    return context.hasIntent("OPTIMIZE") || context.hasIntent("GENERATE") || context.hasIntent("LISTING");
  }

  plan(context: SemanticContext): Task[] {
    const tasks: Task[] = [];

    if (context.hasIntent("OPTIMIZE") && context.entities.targetField) {
      tasks.push(new Task("1", AIDomain.LISTING, CapabilityType.OPTIMIZE_CONTENT, {
        listingId: context.entities.listingId || "UNKNOWN",
        targetField: context.entities.targetField,
      }));
    }

    // Add other listing-related tasks here based on intents/entities

    return tasks;
  }
}