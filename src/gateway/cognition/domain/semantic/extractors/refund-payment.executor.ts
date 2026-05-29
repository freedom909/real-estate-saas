// src/gateway/cognition/domain/agents/payment/executors/refund-payment.executor.ts
import { injectable } from "tsyringe";
import { IExecutor } from "../../planning/types/i-facet.resolver";


@injectable()
export class RefundPaymentExecutor implements IExecutor {
  async execute(payload: Record<string, any>): Promise<any> {
    console.log(`Executing RefundPayment for bookingId: ${payload.bookingId}, paymentId: ${payload.paymentId}`);
    // Simulate API call or business logic
    await new Promise(resolve => setTimeout(resolve, 800));
    if (payload.bookingId === "UNKNOWN") {
      throw new Error("Cannot refund payment for UNKNOWN booking.");
    }
    return { success: true, message: `Payment refunded for booking ${payload.bookingId}.` };
  }
}