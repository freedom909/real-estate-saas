import { injectable } from "tsyringe";
import {
  AIDomain,
  CapabilityType
} from "../../types/enums";


import { SemanticContext } from "../../../semantic/semantic-context";
import { ISubPlanner } from "../../types/ISubPlanner";
import { Task } from "../task";

@injectable()
export class BookingPlanner implements ISubPlanner {

  public canHandle(
    context: SemanticContext
  ): boolean {

    return (
      context.hasIntent("CANCEL") ||
      context.hasIntent("BOOKING")
    );
  }

  public plan(
    context: SemanticContext
  ): Task[] {

    const tasks: Task[] = [];

    // cancel booking
    tasks.push(
      new Task(
        "task-booking-1",
        AIDomain.BOOKING,
        CapabilityType.CANCEL_BOOKING,
        {
          bookingId:
            context.entities.bookingId
              ?? "UNKNOWN"
        }
      )
    );

    // refund payment
    if (
      context.hasIntent("REFUND")
    ) {
      tasks.push(
        new Task(
          "task-payment-1",
          AIDomain.PAYMENT,
          CapabilityType.REFUND_PAYMENT,
          {
            bookingId:
              context.entities.bookingId
          },
          ["task-booking-1"]
        )
      );
    }

    return tasks;
  }
}