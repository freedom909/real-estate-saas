
/**
 * Experience Agent V2 - 完整的经验驱动 Agent！
 *
 * 关键改进:
 * 1. 10+ 个动作空间！
 * 2. 状态向量 + 余弦相似度（无手工权重）
 * 3. 真实业务价值 Reward
 * 4. 无数据泄漏的预测
 * 5. 真正的特征重要性学习
 */

import { WorldModel, Booking, Payment } from "../environment/world-model-v2";
import { EpisodeDatabase, EpisodeRecord, GoalSpec, Context, ActionSpec } from "../memory/episodic/episode-record";
import { EpisodeRetrieverV2, EpisodeMatch } from "../reasoning/episode-retriever-v2";
import { OutcomePredictorV2, Prediction } from "../reasoning/outcome-predictor-v2";
import { ActionRankerV2, RankedAction } from "../reasoning/action-ranker-v2";
import { BusinessRewardFunction } from "../reasoning/business-rewards";

export interface AgentConfig {
  bookingId: string;
  paymentId: string;
}

export class ExperienceAgentV2 {
  public worldModel: WorldModel;
  public episodeDB: EpisodeDatabase;
  public retriever: EpisodeRetrieverV2;
  public predictor: OutcomePredictorV2;
  public ranker: ActionRankerV2;
  public rewardFn: BusinessRewardFunction;

  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;

    this.worldModel = new WorldModel();
    this.episodeDB = new EpisodeDatabase();
    this.retriever = new EpisodeRetrieverV2();
    this.predictor = new OutcomePredictorV2();
    this.rewardFn = new BusinessRewardFunction();
    this.ranker = new ActionRankerV2(this.rewardFn);

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
   * 主循环 - 完整的经验推理！
   */
  async run(goal: GoalSpec, iteration: number): Promise<{
    success: boolean;
    selectedAction?: RankedAction;
    episode?: EpisodeRecord;
  }> {
    console.log("\n" + "=".repeat(120));
    console.log(`🚀 Experience Agent V2 - Episode ${iteration}`);
    console.log("=".repeat(120));
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);

    // ===== 1. 准备 =====
    const startState = this.worldModel.getState();
    const startContext = this.extractContext(startState);
    const possibleActions = this.generatePossibleActions(goal);

    console.log(`\n🎬 Possible Actions (${possibleActions.length}):`);
    possibleActions.forEach(a => {
      const value = this.rewardFn.getBusinessValue(a.name);
      console.log(`  - ${a.name} (value=${value})`);
    });

    // ===== 2. Retrieve 经验 =====
    console.log("\n🔍 Step 1: Retrieve similar episodes...");
    const similarEpisodes = this.retriever.retrieve(goal, startContext, 5);

    if (similarEpisodes.length > 0) {
      console.log(`   Found ${similarEpisodes.length} similar episodes:`);
      similarEpisodes.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.episode.id} (sim=${(m.similarity * 100).toFixed(0)}%, ${m.episode.outcome.success ? "✅" : "❌"})`);
      });
    } else {
      console.log(`   No similar episodes found yet.`);
    }

    // ===== 3. Predict 结果 =====
    console.log("\n🔮 Step 2: Predict outcomes...");
    const predictions = this.predictor.predict(similarEpisodes, possibleActions);

    console.log(`   Predictions:`);
    predictions.forEach(p => {
      const icon = p.confidence === "high" ? "🔵" : p.confidence === "medium" ? "🟡" : "🔴";
      console.log(`   ${icon} ${p.action.name}: ${(p.successProbability * 100).toFixed(0)}% success, evidence=${p.evidenceCount}`);
    });

    // ===== 4. Rank 动作 =====
    console.log("\n🏆 Step 3: Rank actions by value...");
    const rankedActions = this.ranker.rank(predictions);

    console.log(`   Ranked Actions:`);
    rankedActions.forEach(r => {
      const prefix = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : "  ";
      console.log(`   ${prefix} ${r.rank}. ${r.action.action.name} (score=${r.finalScore.toFixed(2)}) - ${r.reason}`);
    });

    // ===== 5. Select & Execute =====
    console.log("\n⚡ Step 4: Execute best action...");
    const selectedAction = this.ranker.select(rankedActions);

    const startTime = Date.now();
    const execResult = await this.executeAction(selectedAction.action.action);
    const duration = Date.now() - startTime;

    // ===== 6. Observe =====
    console.log("\n👁 Step 5: Observe outcome...");
    const finalState = this.worldModel.getState();
    const success = this.checkGoalAchieved(goal, finalState);
    const reward = this.rewardFn.calculate(selectedAction.action.action.name, success);

    console.log(`   Action: ${selectedAction.action.action.name}`);
    console.log(`   Success: ${success ? "✅" : "❌"}`);
    console.log(`   Reward: ${reward}`);

    // ===== 7. Record Episode =====
    console.log("\n📝 Step 6: Record episode...");
    const episode = this.episodeDB.record(
      goal,
      startContext,
      selectedAction.action.action,
      { success, reward, newState: finalState },
      duration
    );

    // ===== 8. Learn =====
    console.log("\n🧠 Step 7: Learn from experience...");
    this.retriever.addEpisode(episode);
    this.retriever.learnFromFeedback(startContext, episode, success);
    this.predictor.recordOutcome(selectedAction.action.action, success, reward, startContext);

    console.log(`   Episode ${episode.id} recorded.`);
    console.log(`   Feature importance updated.`);

    return { success, selectedAction, episode };
  }

  /**
   * 生成 10+ 个真实业务动作！
   */
  private generatePossibleActions(goal: GoalSpec): ActionSpec[] {
    const actions: ActionSpec[] = [
      { name: "booking.cancel", parameters: { bookingId: this.config.bookingId } },
      { name: "payment.refund", parameters: { paymentId: this.config.paymentId } },
      { name: "payment.partial_refund", parameters: { paymentId: this.config.paymentId, percentage: 50 } },
      { name: "booking.send_coupon", parameters: { customerId: "CUST-001", value: 1000 } },
      { name: "booking.change_checkin_date", parameters: { bookingId: this.config.bookingId, newDate: "2026-07-05" } },
      { name: "booking.offer_upgrade", parameters: { bookingId: this.config.bookingId, upgradeType: "deluxe" } },
      { name: "host.contact", parameters: { hostId: "HOST-789", message: "Customer wants to cancel" } },
      { name: "guest.contact", parameters: { customerId: "CUST-001", message: "Let's find a solution" } },
      { name: "wait_24h", parameters: {} },
      { name: "escalate_to_human", parameters: { reason: "Complex issue" } }
    ];

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

  private async executeAction(action: ActionSpec): Promise<{ success: boolean }> {
    console.log(`   🎯 Executing: ${action.name}`);

    // 模拟执行（真实系统会调用真实服务）
    const success = Math.random() < this.getSuccessRateForAction(action.name);

    if (success) {
      // 更新 World Model
      if (action.name === "booking.cancel") {
        this.worldModel.updateBooking(this.config.bookingId, { status: "cancelled" });
        console.log(`   ✅ Booking cancelled.`);
      } else if (action.name === "payment.refund") {
        this.worldModel.updatePayment(this.config.paymentId, { status: "refunded" });
        console.log(`   ✅ Payment refunded.`);
      } else if (action.name === "payment.partial_refund") {
        console.log(`   ✅ Partial refund applied.`);
      } else if (action.name === "wait_24h") {
        const booking = this.worldModel.getBooking(this.config.bookingId);
        if (booking) {
          this.worldModel.updateBooking(this.config.bookingId, {
            hoursBeforeCheckin: Math.max(0, booking.hoursBeforeCheckin - 24)
          });
        }
        console.log(`   ✅ Waited 24 hours.`);
      } else {
        console.log(`   ✅ Action executed successfully.`);
      }
    } else {
      console.log(`   ❌ Action failed.`);
    }

    return { success };
  }

  private getSuccessRateForAction(actionName: string): number {
    switch (actionName) {
      case "booking.cancel": return 0.98;
      case "payment.refund": return 0.92;
      case "payment.partial_refund": return 0.96;
      case "booking.send_coupon": return 0.95;
      case "booking.change_checkin_date": return 0.85;
      case "booking.offer_upgrade": return 0.75;
      case "host.contact": return 0.9;
      case "guest.contact": return 0.95;
      case "wait_24h": return 1.0; // 等待总是成功
      case "escalate_to_human": return 0.99;
      default: return 0.8;
    }
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

  printFullStatus(): void {
    console.log("\n" + "=".repeat(120));
    console.log("📊 Experience Agent V2 - Full Status");
    console.log("=".repeat(120));

    console.log("\n📚 Episodes:");
    console.log(JSON.stringify(this.episodeDB.getStats(), null, 2));

    console.log("\n🧠 Feature Importance (learned):");
    const importance = this.retriever.getFeatureImportance();
    const sortedFeatures = Array.from(importance.entries()).sort((a, b) => b[1] - a[1]);
    sortedFeatures.forEach(([feature, score]) => {
      console.log(`  ${feature}: ${(score * 100).toFixed(1)}% success rate`);
    });

    console.log("\n🌍 World State:");
    console.log(JSON.stringify(this.worldModel.getState(), null, 2));
  }

  reset(): void {
    this.worldModel.reset();
    this.initData();
  }
}
