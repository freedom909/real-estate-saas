//src
import { v4 as uuid } from "uuid";
import { injectable } from "tsyringe";
import { BookingPlanner } from "./booking/booking.planner";
import { ListingPlanner } from "./listing/listing.planner";

import { Task } from "./task";
import { ExecutionPlan } from "./execution-plan";
import { SemanticContext } from "../../semantic/semantic-context";

@injectable()
export class Planner {

 constructor(
   private bookingPlanner:BookingPlanner,

   private listingPlanner:ListingPlanner
 ){}

 async plan(
   context: SemanticContext
 ){

    const tasks: Task[] = [];

    if(
      this.bookingPlanner
        .canHandle(context)
    ){
      tasks.push(
         ...this.bookingPlanner.plan(context)
      );
    }

    return new ExecutionPlan(
      uuid(),
      tasks
    );
 }
}