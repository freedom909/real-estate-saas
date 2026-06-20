
/**
 * Experience Reasoning Agent - 经验推理系统！
 *
 * 不再是：经验存储系统
 *
 * 真正的循环：
 * Goal
 *   ↓
 * Retrieve Episodes
 *   ↓
 * Predict Outcomes
 *   ↓
 * Rank Actions
 *   ↓
 * Execute Best
 *   ↓
 * Record Episode
 *   ↓
 * Learn
 */

import { WorldModel, Booking, Payment } from "../environment/world-model-v2";
import { EpisodeDatabase, EpisodeRecord, GoalSpec, Context, ActionSpec } from "../memory/episodic/episode-record";
import { EpisodeRetriever } from "../reasoning/episode-retriever";
import { OutcomePredictor } from "../reasoning/outcome-predictor";
import { ActionRanker, RankedAction } from "../reasoning/action-ranker";
import { BookingService } from "../executor/booking-service";
import { PaymentService } from "../executor/payment-service";

export interface AgentConfig {
  bookingId: string;
  paymentId: string;
}

export class ExperienceReasoningAgent {
  // 环境
  public worldModel: WorldModel;

  // 服务（依赖 WorldModel）
  public bookingService: BookingService;
  public paymentService: PaymentService;

  // 记忆
  public episodeDB: EpisodeDatabase;

  // 推理
  public episodeRetriever: EpisodeRetriever;
  public outcomePredictor: OutcomePredictor;
  public actionRanker: ActionRanker;

  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;

    // 单一真实源！
    this.worldModel = new WorldModel();

    // 初始化数据
    this.initData();

    // 服务依赖 WorldModel！
    this.bookingService = new BookingService(this.worldModel);
    this.paymentService = new PaymentService(this.worldModel);

    // 记忆
    this.episodeDB = new EpisodeDatabase();

    // 推理
    this.episodeRetriever = new EpisodeRetriever();
    this.outcomePredictor = new OutcomePredictor();
    this.actionRanker = new ActionRanker();
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
      hoursBeforeCheckin: 48 // 这是最重要的特征！
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
   * 主循环 - 经验推理！
   */
  async run(goal: GoalSpec): Promise<{
    success: boolean;
    selectedAction?: RankedAction;
    episode?: EpisodeRecord;
  }> {
    console.log("\n" + "=".repeat(100));
    console.log("🚀 [ExperienceReasoningAgent] Starting");
    console.log("=".repeat(100));
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);

    // ===== 1. 准备上下文 =====
    const startState = this.worldModel.getState();
    const startContext = this.extractContext(startState);
    const possibleActions = this.getPossibleActions(goal);

    console.log(`\n📋 Possible actions: ${possibleActions.map(a => a.name).join(", ")}`);

    // ===== 2. Retrieve Episodes (检索经验) =====
    console.log("\n🔍 Step 1: Retrieve similar episodes...");
    const similarEpisodes = this.episodeRetriever.retrieve(goal, startContext, 5);

    if (similarEpisodes.length > 0) {
      console.log(`   Found ${similarEpisodes.length} similar episode(s):`);
      similarEpisodes.forEach((sim, i) => {
        console.log(`   ${i + 1}. ${sim.episode.id} (sim=${sim.similarity.toFixed(0)}, ${sim.episode.outcome.success ? "✅" : "❌"})`);
      });
    } else {
      console.log("   No similar episodes found.");
    }

    // ===== 3. Predict Outcomes (预测结果) =====
    console.log("\n🔮 Step 2: Predict outcomes...");
    const predictions = this.outcomePredictor.predict(similarEpisodes, possibleActions);

    console.log("   Predictions:");
    predictions.forEach(p => {
      console.log(`   - ${p.action.name}: ${(p.successProbability * 100).toFixed(0)}% chance, evidence=${p.evidence.length}`);
    });

    // ===== 4. Rank Actions (排序动作) =====
    console.log("\n🏆 Step 3: Rank actions...");
    const rankedActions = this.actionRanker.rank(predictions);

    console.log("   Ranked:");
    rankedActions.forEach(r => {
      console.log(`   ${r.rank}. ${r.action.name} - ${(r.successProbability * 100).toFixed(0)}% success - ${r.reason}`);
    });

    // ===== 5. Select & Execute (选择并执行最好的) =====
    console.log("\n⚡ Step 4: Execute best action...");
    const selectedAction = this.actionRanker.select(rankedActions);

    const startTime = Date.now();
    const executionResult = await this.executeAction(selectedAction.action);
    const duration = Date.now() - startTime;

    // ===== 6. Observe Outcome (观察结果) =====
    console.log("\n👁 Step 5: Observe outcome...");
    const finalState = this.worldModel.getState();
    const success = this.checkGoalAchieved(goal, finalState);
    const reward = success ? 1.0 : -0.5;

    console.log(`   Success: ${success ? "✅" : "❌"}`);
    console.log(`   Reward: ${reward}`);

    // ===== 7. Record Episode (记录经验) =====
    console.log("\n📝 Step 6: Record episode...");
    const episode = this.episodeDB.record(
      goal,
      startContext,
      selectedAction.action,
      { success, newState: finalState, reward },
      duration
    );

    // ===== 8. Learn (学习！) =====
    console.log("\n🧠 Step 7: Learn from experience...");

    // 记录到 Retriever（用于相似度学习）
    this.episodeRetriever.addEpisode(episode);
    this.episodeRetriever.learnFromFeedback(startContext, episode, success);

    // 记录到 Predictor（用于预测学习）
    this.outcomePredictor.recordOutcome(selectedAction.action, success, reward);

    console.log(`   Episode ${episode.id} recorded!`);

    return {
      success,
      selectedAction,
      episode
    };
  }

  private getPossibleActions(goal: GoalSpec): ActionSpec[] {
    const actions: ActionSpec[] = [];

    if (goal.entity === "booking" && goal.field === "status" && goal.value === "cancelled") {
      actions.push({ name: "booking.cancel", parameters: { bookingId: this.config.bookingId } });
    }

    if (goal.entity === "payment" && goal.field === "status" && goal.value === "refunded") {
      actions.push({ name: "payment.refund", parameters: { paymentId: this.config.paymentId } });
    }

    // 如果没有匹配目标的，提供默认选项
    if (actions.length === 0) {
      actions.push({ name: "booking.cancel", parameters: { bookingId: this.config.bookingId } });
      actions.push({ name: "payment.refund", parameters: { paymentId: this.config.paymentId } });
    }

    return actions;
  }

  private extractContext(state: any): Context {
    const ctx: Context = {};

    if (state.booking) {
      ctx.booking = {
        status: state.booking.status,
        channel: state.booking.channel,
        hoursBeforeCheckin: state.booking.hoursBeforeCheckin
      };
    }

    if (state.payment) {
      ctx.payment = {
        method: state.payment.method,
        status: state.payment.status
      };
    }

    return ctx;
  }

  private async executeAction(action: ActionSpec): Promise<{ success: boolean }> {
    if (action.name === "booking.cancel") {
      return this.bookingService.cancel(action.parameters.bookingId);
    }

    if (action.name === "payment.refund") {
      return this.paymentService.refund(action.parameters.paymentId);
    }

    return { success: false };
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

  printStatus(): void {
    console.log("\n" + "=".repeat(100));
    console.log("📊 [ExperienceReasoningAgent] Status");
    console.log("=".repeat(100));

    console.log("\n📚 Episodes:");
    console.log(JSON.stringify(this.episodeDB.getStats(), null, 2));

    console.log("\n🔍 Retriever Weights:");
    console.log(JSON.stringify(this.episodeRetriever.getFeatureWeights(), null, 2));

    console.log("\n🔮 Predictor Stats:");
    console.log(JSON.stringify(this.outcomePredictor.getStats(), null, 2));

    console.log("\n🌍 World State:");
    console.log(JSON.stringify(this.worldModel.getState(), null, 2));
  }

  reset(): void {
    this.worldModel.reset();
    this.initData();
  }
}
