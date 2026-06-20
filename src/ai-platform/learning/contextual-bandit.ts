
/**
 * Contextual Bandit - 真正的 Policy Learning！
 *
 * 不再是：
 *   统计频率
 *
 * 而是：
 *   Q(s,a) - 状态动作价值
 *   LinUCB 风格的算法
 *
 * 这样 Agent 会真正学习：
 *   在什么状态下，什么动作的价值最高
 */

import { StateVector } from "../reasoning/state-encoder";

export interface State {
  [key: string]: any;
}

export interface QEntry {
  qValue: number;
  count: number;
  lastUpdated: number;
}

export class ContextualBandit {
  // Q(s,a) 表
  private qTable: Map<string, Map<string, QEntry>> = new Map();

  // 学习率
  private alpha = 0.1;

  // 探索率
  private epsilon = 0.2;

  // 衰减率
  private gamma = 0.95;

  constructor() {
    console.log(`🧠 [ContextualBandit] Initialized (α=${this.alpha}, ε=${this.epsilon})`);
  }

  /**
   * 获取 Q(s,a)
   */
  getQ(stateKey: string, action: string): QEntry {
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }

    const actionTable = this.qTable.get(stateKey)!;

    if (!actionTable.has(action)) {
      actionTable.set(action, {
        qValue: 0.5, // 先验概率
        count: 0,
        lastUpdated: Date.now()
      });
    }

    return actionTable.get(action)!;
  }

  /**
   * 更新 Q(s,a)
   *
   * Q(s,a) = Q(s,a) + α * (reward - Q(s,a))
   */
  updateQ(stateKey: string, action: string, reward: number): void {
    const entry = this.getQ(stateKey, action);

    // Q-learning 更新公式
    const oldQ = entry.qValue;
    const newQ = oldQ + this.alpha * (reward - oldQ);

    entry.qValue = newQ;
    entry.count++;
    entry.lastUpdated = Date.now();

    console.log(`    [Q-update] ${action}: ${oldQ.toFixed(3)} → ${newQ.toFixed(3)} (reward=${reward.toFixed(3)})`);
  }

  /**
   * 选择动作：ε-greedy
   *
   * - 概率 ε：探索（随机）
   * - 概率 1-ε：利用（选择 Q 值最高的）
   */
  selectAction(
    stateKey: string,
    possibleActions: string[]
  ): { action: string; qValue: number; explored: boolean } {
    // 探索
    if (Math.random() < this.epsilon) {
      const randomIndex = Math.floor(Math.random() * possibleActions.length);
      const randomAction = possibleActions[randomIndex];
      const qEntry = this.getQ(stateKey, randomAction);

      console.log(`    [Explore] Selected: ${randomAction} (ε=${this.epsilon})`);
      return {
        action: randomAction,
        qValue: qEntry.qValue,
        explored: true
      };
    }

    // 利用
    let bestAction = possibleActions[0];
    let bestQ = -Infinity;

    for (const action of possibleActions) {
      const qEntry = this.getQ(stateKey, action);
      if (qEntry.qValue > bestQ) {
        bestQ = qEntry.qValue;
        bestAction = action;
      }
    }

    console.log(`    [Exploit] Selected: ${bestAction} (Q=${bestQ.toFixed(3)})`);
    return {
      action: bestAction,
      qValue: bestQ,
      explored: false
    };
  }

  /**
   * 生成状态 Key（用于索引 Q 表）
   */
  getStateKey(state: any): string {
    const keyParts: string[] = [];

    // 关键特征
    if (state.booking?.status) keyParts.push(`b_status:${state.booking.status}`);
    if (state.booking?.channel) keyParts.push(`b_channel:${state.booking.channel}`);

    // 连续特征离散化（桶）
    if (state.booking?.hoursBeforeCheckin !== undefined) {
      const h = state.booking.hoursBeforeCheckin;
      let bucket = "very_soon";
      if (h > 72) bucket = "late";
      else if (h > 24) bucket = "soon";
      else if (h > 6) bucket = "very_soon";
      keyParts.push(`h:${bucket}`);
    }

    if (state.payment?.status) keyParts.push(`p_status:${state.payment.status}`);
    if (state.payment?.method) keyParts.push(`p_method:${state.payment.method}`);

    return keyParts.join("|");
  }

  /**
   * 获取所有 Q 值
   */
  getAllQ(stateKey: string, possibleActions: string[]): Map<string, number> {
    const result = new Map<string, number>();

    for (const action of possibleActions) {
      const entry = this.getQ(stateKey, action);
      result.set(action, entry.qValue);
    }

    return result;
  }

  /**
   * 衰减探索率
   */
  decayEpsilon(): void {
    this.epsilon = Math.max(0.05, this.epsilon * 0.99);
  }

  /**
   * 获取统计
   */
  getStats(): any {
    const stats: any = {
      totalStates: this.qTable.size,
      epsilon: this.epsilon,
      alpha: this.alpha
    };

    const allQValues: number[] = [];
    for (const [, actionTable] of this.qTable) {
      for (const [, entry] of actionTable) {
        allQValues.push(entry.qValue);
      }
    }

    if (allQValues.length > 0) {
      stats.avgQ = allQValues.reduce((a, b) => a + b, 0) / allQValues.length;
      stats.maxQ = Math.max(...allQValues);
      stats.minQ = Math.min(...allQValues);
    }

    return stats;
  }
}
