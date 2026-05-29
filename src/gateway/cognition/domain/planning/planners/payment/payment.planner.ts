// src/gateway/cognition/domain/planning/planners/payment.planner.ts
import { injectable } from "tsyringe";

import { Task } from "../task";
import { SemanticContext } from "../../../semantic/semantic-context";
import { AIDomain, CapabilityType } from "../../types/enums";

@injectable()
export class PaymentPlanner {
  canHandle(context: SemanticContext): boolean {
    return context.hasIntent("REFUND") || context.hasIntent("PAYMENT");
  }

  plan(context: SemanticContext): Task[] {
    const tasks: Task[] = [];

    if (context.hasIntent("REFUND")) {
      tasks.push(new Task("1", AIDomain.PAYMENT, CapabilityType.REFUND_PAYMENT, {
        paymentId: context.entities.paymentId || "UNKNOWN",
        bookingId: context.entities.bookingId || "UNKNOWN", // May be linked to a booking
      }));
    }

    return tasks;
  }
}