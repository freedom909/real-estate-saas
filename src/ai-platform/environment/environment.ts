
/**
 * Environment - 真实环境模拟！
 *
 * 不再是：
 *   success = Math.random() < rate
 *
 * 而是：
 *   基于真实业务逻辑计算结果
 *
 * 并且：
 *   Reward = f(satisfaction, revenue, risk)
 */

export interface EnvironmentState {
  booking: {
    id: string;
    status: string;
    channel: string;
    hoursBeforeCheckin: number;
    amount: number;
    customerLoyaltyTier: "basic" | "silver" | "gold";
    previousCancellations: number;
  };
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  };
}

export interface EnvironmentOutcome {
  success: boolean;
  details: {
    guestSatisfaction: number; // 0-1
    revenueImpact: number; // 日元
    hostSatisfaction: number; // 0-1
    operationalRisk: number; // 0-1
    reviewRisk: number; // 0-1
  };
  reward: number;
}

export interface ActionExecutionParams {
  actionType: string;
  parameters: Record<string, any>;
}

export class RealisticEnvironment {
  private state: EnvironmentState;

  constructor(initialState: EnvironmentState) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  /**
   * 执行动作，基于真实业务规则！
   */
  execute(params: ActionExecutionParams): EnvironmentOutcome {
    const { actionType, parameters } = params;

    // 基于真实业务逻辑计算结果
    let outcome: EnvironmentOutcome;

    switch (actionType) {
      case "cancel":
        outcome = this.executeCancel(parameters);
        break;
      case "refund":
        outcome = this.executeRefund(parameters);
        break;
      case "partial_refund":
        outcome = this.executePartialRefund(parameters);
        break;
      case "send_coupon":
        outcome = this.executeSendCoupon(parameters);
        break;
      case "change_checkin":
        outcome = this.executeChangeCheckin(parameters);
        break;
      case "contact_guest":
        outcome = this.executeContactGuest(parameters);
        break;
      default:
        outcome = this.executeGeneric(actionType, parameters);
    }

    // 更新状态
    this.applyStateChange(params, outcome);

    return outcome;
  }

  private executeCancel(params: any): EnvironmentOutcome {
    // 真实取消逻辑
    const hours = this.state.booking.hoursBeforeCheckin;
    const success = hours > 24; // 提前24小时以上才能成功取消

    // 计算满意度
    let guestSatisfaction = 0.5;
    if (hours > 72) guestSatisfaction = 0.9;
    else if (hours > 24) guestSatisfaction = 0.7;
    else guestSatisfaction = 0.3;

    // 收入影响
    const revenueImpact = -this.state.booking.amount * (success ? 1 : 0.5);

    // 房东满意度
    let hostSatisfaction = 0.6;
    if (hours > 72) hostSatisfaction = 0.8;

    // 风险
    const reviewRisk = success ? 0.1 : 0.5;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.2,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executeRefund(params: any): EnvironmentOutcome {
    const hours = this.state.booking.hoursBeforeCheckin;
    const success = hours > 48;

    let guestSatisfaction = 0.8;
    const revenueImpact = -this.state.booking.amount;

    let hostSatisfaction = 0.5;
    const reviewRisk = 0.1;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.3,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executePartialRefund(params: any): EnvironmentOutcome {
    const ratio = params.ratio || 0.5;
    const hours = this.state.booking.hoursBeforeCheckin;
    const success = hours > 24;

    let guestSatisfaction = 0.6;
    const revenueImpact = -this.state.booking.amount * ratio;

    let hostSatisfaction = 0.7;
    const reviewRisk = 0.2;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.15,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executeSendCoupon(params: any): EnvironmentOutcome {
    const couponValue = params.value || 1000;
    const hours = this.state.booking.hoursBeforeCheckin;

    // 优惠券通常都能成功
    const success = true;

    let guestSatisfaction = 0.75;
    if (hours < 24) guestSatisfaction = 0.9; // 快到入住时间时，优惠券更受欢迎

    const revenueImpact = -couponValue;
    const hostSatisfaction = 0.7;
    const reviewRisk = 0.05;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.05,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executeChangeCheckin(params: any): EnvironmentOutcome {
    const hours = this.state.booking.hoursBeforeCheckin;
    const success = hours > 72;

    let guestSatisfaction = 0.7;
    const revenueImpact = -this.state.booking.amount * 0.3;
    let hostSatisfaction = 0.6;
    const reviewRisk = 0.15;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.25,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executeContactGuest(params: any): EnvironmentOutcome {
    // 联系客人通常成功
    const success = true;

    let guestSatisfaction = 0.65;
    const revenueImpact = 0;
    let hostSatisfaction = 0.8;
    const reviewRisk = 0.02;

    return {
      success,
      details: {
        guestSatisfaction,
        revenueImpact,
        hostSatisfaction,
        operationalRisk: 0.1,
        reviewRisk
      },
      reward: this.calculateReward(guestSatisfaction, revenueImpact, reviewRisk)
    };
  }

  private executeGeneric(actionType: string, params: any): EnvironmentOutcome {
    return {
      success: Math.random() > 0.3,
      details: {
        guestSatisfaction: 0.5,
        revenueImpact: 0,
        hostSatisfaction: 0.5,
        operationalRisk: 0.3,
        reviewRisk: 0.2
      },
      reward: 0
    };
  }

  /**
   * 核心：计算 Reward
   *
   * Reward = 0.5*satisfaction + 0.3*revenue/10000 - 0.2*risk
   */
  private calculateReward(
    guestSatisfaction: number,
    revenueImpact: number,
    reviewRisk: number
  ): number {
    // 归一化收入（假设最大订单金额 100000 日元）
    const normalizedRevenue = Math.max(-1, Math.min(1, revenueImpact / 50000));

    // 计算最终 Reward
    const reward =
      guestSatisfaction * 0.5 +
      normalizedRevenue * 0.3 +
      (1 - reviewRisk) * 0.2;

    return reward;
  }

  private applyStateChange(params: ActionExecutionParams, outcome: EnvironmentOutcome): void {
    // 更新状态
    if (params.actionType === "cancel") {
      this.state.booking.status = outcome.success ? "cancelled" : "confirmed";
    }

    if (params.actionType === "refund") {
      this.state.payment.status = outcome.success ? "refunded" : "paid";
    }
  }

  getState(): EnvironmentState {
    return JSON.parse(JSON.stringify(this.state));
  }

  reset(initialState: EnvironmentState): void {
    this.state = JSON.parse(JSON.stringify(initialState));
  }
}
