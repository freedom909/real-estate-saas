
/**
 * Business Rewards - 真实的业务价值！
 *
 * 不再是: reward = success ? 1 : -0.5
 *
 * 而是:
 *  - CancelBooking = +20
 *  - RefundPayment = +15
 *  - PartialRefund = +10
 *  - ContactCustomer = +5
 *  - EscalateToHuman = -5 (避免 escalation)
 *  - CustomerEscalation = -50 (非常糟糕！)
 *  - Wait24Hours = -1 (拖延有成本)
 */

export interface RewardConfig {
  [actionName: string]: {
    success: number;
    failure: number;
    businessValue: number;
  };
}

export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  "booking.cancel": {
    success: 20,
    failure: -10,
    businessValue: 20
  },
  "payment.refund": {
    success: 15,
    failure: -5,
    businessValue: 15
  },
  "payment.partial_refund": {
    success: 10,
    failure: -3,
    businessValue: 10
  },
  "booking.send_coupon": {
    success: 8,
    failure: -2,
    businessValue: 8
  },
  "booking.change_checkin_date": {
    success: 12,
    failure: -5,
    businessValue: 12
  },
  "booking.offer_upgrade": {
    success: 18,
    failure: -8,
    businessValue: 18
  },
  "host.contact": {
    success: 6,
    failure: -1,
    businessValue: 6
  },
  "guest.contact": {
    success: 6,
    failure: -1,
    businessValue: 6
  },
  "wait_24h": {
    success: -1, // 等待不太好
    failure: -2,
    businessValue: -1
  },
  "escalate_to_human": {
    success: 5,
    failure: -10,
    businessValue: 5
  }
};

export class BusinessRewardFunction {
  private config: RewardConfig;

  constructor(config?: RewardConfig) {
    this.config = config || DEFAULT_REWARD_CONFIG;
  }

  /**
   * 计算 Reward
   */
  calculate(actionName: string, success: boolean): number {
    const cfg = this.config[actionName];

    if (!cfg) {
      // 默认
      return success ? 5 : -2;
    }

    return success ? cfg.success : cfg.failure;
  }

  /**
   * 获取动作的业务价值（用于排序）
   */
  getBusinessValue(actionName: string): number {
    const cfg = this.config[actionName];
    return cfg?.businessValue || 0;
  }

  /**
   * 计算完整的分数（成功率 + 业务价值）
   */
  computeScore(successRate: number, actionName: string): number {
    const value = this.getBusinessValue(actionName);
    // 权衡: 成功率 60%, 业务价值 40%
    return successRate * 0.6 + Math.max(0, value) * 0.04; // normalize
  }
}
