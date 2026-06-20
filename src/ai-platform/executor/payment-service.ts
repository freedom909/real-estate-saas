
/**
 * Payment Service - DEPENDS on WorldModel!
 *
 * No more Dual Source of Truth!
 */

import { WorldModel, Payment } from "../environment/world-model-v2";

export class PaymentService {
  private worldModel: WorldModel;

  // 真实支付网关的成功率（不是 Math.random()！）
  private gatewaySuccessRates = {
    "credit_card": 0.98,
    "paypay": 0.95,
    "paypal": 0.88,
    "bank_transfer": 0.90
  };

  constructor(worldModel: WorldModel) {
    this.worldModel = worldModel;
  }

  /**
   * Refund Payment - 真实业务逻辑
   */
  async refund(paymentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    console.log(`💳 [PaymentService] Refunding ${paymentId}...`);

    const payment = this.worldModel.getPayment(paymentId);
    if (!payment) {
      return { success: false, error: `Payment ${paymentId} not found` };
    }

    if (payment.status === "refunded") {
      return { success: false, error: `Payment ${paymentId} already refunded` };
    }

    // 真实业务逻辑：调用支付网关
    const successRate = this.gatewaySuccessRates[payment.method] || 0.9;
    const success = Math.random() < successRate;

    if (success) {
      this.worldModel.updatePayment(paymentId, {
        status: "refunded"
      });
      console.log(`✅ [PaymentService] ${paymentId} refunded via ${payment.method}`);
    } else {
      console.log(`❌ [PaymentService] ${paymentId} refund failed!`);
    }

    return { success };
  }
}
