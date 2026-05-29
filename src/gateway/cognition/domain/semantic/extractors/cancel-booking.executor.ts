// src/gateway/cognition/domain/agents/booking/executors/cancel-booking.executor.ts
import { injectable } from "tsyringe";
import { IExecutor } from "../../planning/types/i-facet.resolver";


@injectable()
export class CancelBookingExecutor implements IExecutor {
  async execute(payload: Record<string, any>): Promise<any> {
    console.log(`Executing CancelBooking for bookingId: ${payload.bookingId}`);
    // Simulate API call or business logic
    await new Promise(resolve => setTimeout(resolve, 600));
    if (payload.bookingId === "UNKNOWN") {
      throw new Error("Cannot cancel UNKNOWN booking.");
    }
    return { success: true, message: `Booking ${payload.bookingId} cancelled successfully.` };
  }
}