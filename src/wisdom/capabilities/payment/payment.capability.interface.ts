export interface IPaymentCapability {
  processPayment(input: any): Promise<any>;
  processRefund(paymentId: string, reason: string): Promise<any>;
}
