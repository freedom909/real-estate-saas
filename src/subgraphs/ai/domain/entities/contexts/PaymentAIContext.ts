export interface PaymentAIContext {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata: Record<string, any>;
}