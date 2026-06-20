
/**
 * Experience Driven Agent - 完整的经验驱动 Agent！
 *
 * 完整架构：
 * Goal
 *   ↓
 * Retrieve Episodes
 *   ↓
 * Predict Outcomes
 *   ↓
 * Rule Extraction
 *   ↓
 * Policy Store
 *   ↓
 * Action Competition
 *   ↓
 * Execute
 *   ↓
 * Observe
 *   ↓
 * Feedback
 *   ↓
 * Policy Learning
 */

import { WorldModel, Booking, Payment } from "../environment/world-model-v2";
import { EpisodeDatabase, EpisodeRecord, GoalSpec, Context, ActionSpec } from "../memory/episodic/episode-record";
import { PolicyLearner } from "../learning/policy-learner";
import { PolicyStore } from "../memory/policy-store";
import { RuleExtractor } from "../reasoning/rule-extractor";
import { ActionRegistry, ActionDefinition, registerDefaultActions } from "../action/action-registry";
import { BusinessRewardFunction, DEFAULT_REWARD_CONFIG } from "../reasoning/business-rewards";
import { StateEncoderV2, StateVector } from "../reasoning/state-encoder";

export class ExperienceDrivenAgent {
  // 核心模块
  public worldModel: WorldModel;
  public episodeDB: EpisodeDatabase;
  public policyLearner: PolicyLearner;
  public actionRegistry: ActionRegistry;
  public rewardFn: BusinessRewardFunction;
  public stateEncoder: StateEncoderV2;

  private config: { bookingId: string; paymentId: string };

  constructor(config: { bookingId: string; paymentId: string }) {
    this.config = config;

    // 初始化模块
    this.worldModel = new WorldModel();
    this.episodeDB = new EpisodeDatabase();
    this.policyLearner = new PolicyLearner();
    this.rewardFn = new BusinessRewardFunction(DEFAULT_REWARD_CONFIG);
    this.stateEncoder = new StateEncoderV2();

    // 注册动作
    this.actionRegistry = new ActionRegistry();
    registerDefaultActions(this.actionRegistry);

    // 初始化数据
    this.initData();
  }

  private initData(): void {
    const booking: Booking = {
      id: this.config.bookingId,
      status: "confirmed",
      customerId: "CUST-001",
      listingId: "LST-001",
      checkinDate: "2026-07-01",
      amount: 15000,
      channel: "airbnb",
      hoursBeforeCheckin: 48
    };

    const payment: Payment = {
      id: this.config.paymentId,
      bookingId: this.config.bookingId,
      method: "credit_card",
      status: "paid",
      amount: 15000
    };

    this.worldModel.setBooking(booking);
    this.worldModel.setPayment(payment);
  }

  /**
   * 完整运行一次！
   */
  async run(goal: GoalSpec, iteration: number): Promise<{
    success: boolean;
    selectedAction: ActionSpec;
    episode?: EpisodeRecord;
  }> {
    console.log(`\n${"=".repeat(120)}`);
    console.log(`🚀 Experience Driven Agent - Episode ${iteration}`);
    console.log(`=".repeat(120)}`);
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);

    // ===== 1. 获取当前状态 =====
    const startState = this.worldModel.getState();
    const startContext = this.extractContext(startState);

    // ===== 2. 获取可用动作（来自 Registry） =====
    const possibleActions = this.generateActionsFromRegistry(goal);
    console.log(`\n📋 Possible Actions (${possibleActions.length} from registry):`);
    possibleActions.forEach(a => console.log(`  - ${a.name}`));

    // ===== 3. 检查 Policy Store =====
    const policyResult = this.policyLearner.getBestActionForState(startContext);
    let usedPolicyRule = false;

    if (policyResult.action && policyResult.confidence > 0.7) {
      console.log(`\n🎯 [Policy] Found high-confidence policy rule!`);
      usedPolicyRule = true;
    }

    // ===== 4. 检索相似 Episode =====
    console.log(`\n🔍 Step 1: Retrieving similar episodes...`);
    const similarEpisodes = this.retrieveSimilarEpisodes(goal, startContext);

    // ===== 5. 预测动作结果 =====
    console.log(`\n🔮 Step 2: Predicting outcomes...`);
    const predictions = this.predictOutcomes(similarEpisodes, possibleActions, usedPolicyRule ? policyResult.action : undefined);

    // ===== 6. 动作竞争与排序 =====
    console.log(`\n🏆 Step 3: Action competition...`);
    const rankedActions = this.rankActions(predictions, policyResult);

    // ===== 7. 选择并执行 =====
    console.log(`\n⚡ Step 4: Executing best action...`);
    const selectedAction = rankedActions[0].action;
    const executionResult = await this.executeAction(selectedAction);

    // ===== 8. 观察结果 =====
    console.log(`\n👁 Step 5: Observing outcome...`);
    const finalState = this.worldModel.getState();
    const success = this.checkGoalAchieved(goal, finalState);
    const reward = this.rewardFn.calculate(selectedAction.name, success);

    console.log(`  Action: ${selectedAction.name}`);
    console.log(`  Success: ${success ? "✅" : "❌"}`);
    console.log(`  Reward: ${reward}`);

    // ===== 9. 记录 Episode =====
    console.log(`\n📝 Step 6: Recording episode...`);
    const episode = this.episodeDB.record(
      goal,
      startContext,
      selectedAction,
      { success, reward, newState: finalState },
      0
    );

    // ===== 10. 学习！（关键步骤） =====
    console.log(`\n🧠 Step 7: Policy Learning...`);
    const allEpisodes = this.episodeDB.getAll();

    // 让 Policy Learner 学习
    this.policyLearner.learnFromEpisodes(allEpisodes, iteration % 5 === 0); // 每5轮强制学习

    // 记录 Policy 反馈
    if (policyResult.rule) {
      this.policyLearner.recordFeedback(policyResult.rule.id, success);
    }

    console.log(`\n✅ Episode ${iteration} complete!`);

    return {
      success,
      selectedAction,
      episode
    };
  }

  private generateActionsFromRegistry(goal: GoalSpec): ActionSpec[] {
    const actions: ActionSpec[] = [];
    const definitions = this.actionRegistry.getAll();

    for (const def of definitions) {
      actions.push({
        name: def.id,
        parameters: {
          bookingId: this.config.bookingId,
          paymentId: this.config.paymentId,
          ...def.defaultParams
        }
      });
    }

    return actions;
  }

  private extractContext(state: any): Context {
    return {
      booking: state.booking ? {
        status: state.booking.status,
        channel: state.booking.channel,
        hoursBeforeCheckin: state.booking.hoursBeforeCheckin
      } : undefined,
      payment: state.payment ? {
        method: state.payment.method,
        status: state.payment.status
      } : undefined
    };
  }

  private retrieveSimilarEpisodes(goal: GoalSpec, context: Context): EpisodeRecord[] {
    // 简化版：找到相同 goal 的成功 episode
    const episodes = this.episodeDB.getAll();
    const similar = episodes
      .filter(e => e.goal.entity === goal.entity && e.outcome.success)
      .slice(0, 5);

    if (similar.length > 0) {
      console.log(`  Found ${similar.length} relevant successful episodes`);
    }

    return similar;
  }

  private predictOutcomes(
    similarEpisodes: EpisodeRecord[],
    possibleActions: ActionSpec[],
    policyAction?: string
  ): Array<{ action: ActionSpec; successProb: number; evidenceCount: number }> {
    const results: Array<{ action: ActionSpec; successProb: number; evidenceCount: number }> = [];

    for (const action of possibleActions) {
      // 从相似 episode 计算成功率
      const related = similarEpisodes.filter(e => e.action.name === action.name);

      let successProb = 0.5; // 先验
      let evidenceCount = 0;

      if (related.length > 0) {
        const successCount = related.filter(e => e.outcome.success).length;
        successProb = successCount / related.length;
        evidenceCount = related.length;
      }

      // 如果 Policy 推荐这个动作，给予 boost
      if (policyAction === action.name) {
        successProb = Math.min(1, successProb * 1.2); // 提升20%
        console.log(`  🎯 [Policy Boost] ${action.name}: ${(successProb * 100).toFixed(0)}% (policy recommended)`);
      }

      results.push({
        action,
        successProb,
        evidenceCount
      });
    }

    // 打印结果
    results.sort((a, b) => b.successProb - a.successProb);
    results.slice(0, 3).forEach(r => {
      console.log(`  - ${r.action.name}: ${(r.successProb * 100).toFixed(0)}% (${r.evidenceCount} samples)`);
    });

    return results;
  }

  private rankActions(
    predictions: Array<{ action: ActionSpec; successProb: number; evidenceCount: number }>,
    policyResult: { action?: string; confidence: number }
  ): Array<{ action: ActionSpec; score: number }> {
    const ranked = predictions.map(p => {
      // 分数 = 成功率 * 0.6 + 业务价值 * 0.4
      const businessValue = Math.max(0, this.rewardFn.getBusinessValue(p.action.name) / 50);
      let score = p.successProb * 0.6 + businessValue * 0.4;

      // Policy 优先
      if (policyResult.action === p.action.name) {
        score *= 1.5; // 50% boost
      }

      return {
        action: p.action,
        score
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    console.log(`  Top 3:`);
    ranked.slice(0, 3).forEach((r, i) => {
      console.log(`    ${i + 1}. ${r.action.name} (score=${r.score.toFixed(2)})`);
    });

    return ranked;
  }

  private async executeAction(action: ActionSpec): Promise<{ success: boolean }> {
    // 模拟执行
    const success = Math.random() < this.getActionSuccessBaseRate(action.name);

    // 更新状态
    if (success) {
      if (action.name === "booking.cancel") {
        this.worldModel.updateBooking(this.config.bookingId, { status: "cancelled" });
      }
      if (action.name === "payment.refund") {
        this.worldModel.updatePayment(this.config.paymentId, { status: "refunded" });
      }
    }

    return { success };
  }

  private getActionSuccessBaseRate(action: string): number {
    const rates: Record<string, number> = {
      "booking.cancel": 0.98,
      "payment.refund": 0.92,
      "payment.partial_refund": 0.96,
      "booking.send_coupon": 0.95,
      "booking.change_checkin_date": 0.85,
      "booking.offer_upgrade": 0.75,
      "host.contact": 0.9,
      "guest.contact": 0.95,
      "wait_24h": 1.0,
      "escalate_to_human": 0.99
    };
    return rates[action] || 0.8;
  }

  private checkGoalAchieved(goal: GoalSpec, state: any): boolean {
    if (goal.entity === "booking" && goal.field === "status") {
      return state.booking?.status === goal.value;
    }
    if (goal.entity === "payment" && goal.field === "status") {
      return state.payment?.status === goal.value;
    }
    return false;
  }

  printFinalStats(): void {
    console.log(`\n${"=".repeat(120)}`);
    console.log(`📊 FINAL SYSTEM STATUS`);
    console.log(`=".repeat(120)}`);

    // Episode Stats
    console.log(`\n📚 Episodes:`);
    console.log(JSON.stringify(this.episodeDB.getStats(), null, 2));

    // Policy Stats
    console.log(`\n🧠 Policy Store:`);
    const policyStats = this.policyLearner.getPolicyStore().getStats();
    console.log(`  Total rules: ${policyStats.totalRules}`);
    console.log(`  High-confidence rules: ${policyStats.highConfidenceRules}`);
    console.log(`  Top rules:`);
    policyStats.topRules.forEach(r => {
      console.log(`    - ${r.name} (confidence=${(r.confidence * 100).toFixed(0)}%)`);
    });

    // World State
    console.log(`\n🌍 World State:`);
    console.log(JSON.stringify(this.worldModel.getState(), null, 2));
  }

  reset(): void {
    this.worldModel.reset();
    this.initData();
  }
}
