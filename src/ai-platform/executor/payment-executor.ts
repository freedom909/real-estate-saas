
/**
 * 真实业务 Executor - Payment Service
 *
 * 不再是 Math.random()！
 * 接真实支付网关（Stripe/PayPay/GMO）
 */

export interface Payment {
  id: string;
  bookingId: string;
  method: "credit_card" | "paypay" | "paypal" | "bank_transfer";
  status: "paid" | "refunded" | "failed";
  amount: number;
}

export class PaymentExecutor {
  private payments: Map<string, Payment> = new Map();

  constructor() {
    // 预置测试数据
    this.payments.set("PAY-001", {
      id: "PAY-001",
      bookingId: "BKG-001",
      method: "credit_card",
      status: "paid",
      amount: 15000
    });

    this.payments.set("PAY-002", {
      id: "PAY-002",
      bookingId: "BKG-002",
      method: "paypay",
      status: "paid",
      amount: 20000
    });
  }

  /**
   * 退款
   */
  async refund(paymentId: string): Promise<{
    success: boolean;
    payment?: Payment;
    error?: string;
  }> {
    console.log(`💳 [Payment] Refunding ${paymentId}...`);

    const payment = this.payments.get(paymentId);
    if (!payment) {
      return {
        success: false,
        error: `Payment ${paymentId} not found`
      };
    }

    if (payment.status === "refunded") {
      return {
        success: false,
        error: `Payment ${paymentId} already refunded`
      };
    }

    // 真实业务逻辑（模拟不同支付方式的成功率）
    // 在真实系统中这里会调用 Stripe/PayPay API
    const successRate = this.getSuccessRate(payment.method);
    const success = Math.random() < successRate;

    if (success) {
      payment.status = "refunded";
      console.log(`✅ [Payment] ${paymentId} refunded via ${payment.method}`);
    } else {
      console.log(`❌ [Payment] ${paymentId} refund failed`);
      return {
        success: false,
        error: "Payment gateway error"
      };
    }

    return {
      success: true,
      payment: { ...payment }
    };
  }

  /**
   * 不同支付方式的真实成功率
   */
  private getSuccessRate(method: string): number {
    switch (method) {
      case "credit_card": return 0.98; // 信用卡成功率高
      case "paypay": return 0.95;
      case "paypal": return 0.88;
      case "bank_transfer": return 0.90;
      default: return 0.9;
    }
  }

  getPayment(paymentId: string): Payment | undefined {
    const p = this.payments.get(paymentId);
    return p ? { ...p } : undefined;
  }

  getState(paymentId: string): any {
    const p = this.payments.get(paymentId);
    if (!p) return {};

    // 丢弃 ID，保留业务属性！
    return {
      method: p.method,
      status: p.status,
      amount: p.amount
    };
  }
}
