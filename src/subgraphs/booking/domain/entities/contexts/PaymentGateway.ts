import { injectable } from "tsyringe";

@injectable()
export class PaymentGateway {
  /**
   * Fetches raw transaction data from the Payment Subgraph.
   * In a real federation, this would use a GraphQL client or internal SDK.
   */
  async fetchPaymentData(transactionId: string) {
    // Mocked response from Payment Subgraph
    return {
      id: transactionId,
      customerId: "user_8821",
      amount_cents: 15000,
      currency_code: "USD",
      method_type: "STRIPE_CC",
      network_data: {
        ip: "192.0.2.1",
        ua: "Mozilla/5.0..."
      },
      created_at: new Date().toISOString()
    };
  }
}