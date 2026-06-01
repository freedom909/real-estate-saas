import { injectable } from "tsyringe";
import { PaymentGateway } from "./PaymentGateway";
import { PaymentAIContext } from "./PaymentAIContext";

@injectable()
export class PaymentACL {
  constructor(private gateway: PaymentGateway) {}

  async getContext(transactionId: string): Promise<PaymentAIContext> {
    const raw = await this.gateway.fetchPaymentData(transactionId);

    return {
      transactionId: raw.id,
      userId: raw.customerId,
      amount: raw.amount_cents / 100,
      currency: raw.currency_code,
      paymentMethod: raw.method_type,
      ipAddress: raw.network_data.ip,
      userAgent: raw.network_data.ua,
      timestamp: raw.created_at,
      metadata: {}
    };
  }
}