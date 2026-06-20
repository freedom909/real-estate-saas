
/**
 * ExperienceAgent - 真实经验学习 Agent
 *
 * 不再堆版本号，这是一个稳定的架构！
 *
 * World State (持久)
 *      ↓
 * Episode (记录)
 *      ↓
 * Rule Learning (提取)
 *      ↓
 * Policy Learning (Q Table)
 *      ↓
 * Next Decision
 */

import { WorldModel } from "../environment/world-model";
import { EventBus } from "../environment/event-bus";
import { EpisodeDatabase, EpisodeRecord, GoalSpec, Context, ActionSpec, Outcome } from "../memory/episodic/episode-record";
import { RuleLearner, ProductionRule } from "../learning/rule-learner";
import { PolicyLearner, Strategy, StateFeatures } from "../learning/policy-learner";
import { BookingExecutor } from "../executor/booking-executor";
import { PaymentExecutor } from "../executor/payment-executor";

export interface AgentConfig {
  bookingId: string;
  paymentId: string;
}

export class ExperienceAgent {
  public worldModel: WorldModel;
  public eventBus: EventBus;
  public episodeDB: EpisodeDatabase;
  public ruleLearner: RuleLearner;
  public policyLearner: PolicyLearner;

  public bookingExecutor: BookingExecutor;
  public paymentExecutor: PaymentExecutor;

  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.worldModel = new WorldModel();
    this.eventBus = new EventBus();
    this.episodeDB = new EpisodeDatabase();
    this.ruleLearner = new RuleLearner();
    this.policyLearner = new PolicyLearner();
    this.bookingExecutor = new BookingExecutor();
    this.paymentExecutor = new PaymentExecutor();

    this.initializeWorld();
  }

  private initializeWorld(): void {
    const booking = this.bookingExecutor.getBooking(this.config.bookingId);
    const payment = this.paymentExecutor.getPayment(this.config.paymentId);

    if (booking) {
      this.worldModel.setEntity("booking", booking);
    }
    if (payment) {
      this.worldModel.setEntity("payment", payment);
    }

    console.log("🌍 [ExperienceAgent] World initialized");
  }

  /**
   * 主运行循环
   */
  async run(goal: GoalSpec): Promise<{
    success: boolean;
    strategy: Strategy;
    episode?: EpisodeRecord;
  }> {
    console.log("\n" + "=".repeat(100));
    console.log("🚀 [ExperienceAgent] Starting...");
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);
    console.log("=".repeat(100));

    const start = Date.now();
    const startState = this.worldModel.getState();
    const startContext = this.extractContext(startState);
    const stateFeatures = this.extractStateFeatures(goal, startContext);

    // 1. Policy Learning 决定策略
    const strategy = this.policyLearner.selectStrategy(stateFeatures);
    console.log(`🎯 Strategy selected: ${strategy}`);

    let success = false;
    let action: ActionSpec | null = null;
    let error: string | undefined;

    try {
      // 2. 执行策略
      const result = await this.executeStrategy(strategy, goal, startContext);
      success = result.success;
      action = result.action;
      error = result.error;

      if (success) {
        console.log(`✅ Action ${action?.name} succeeded!`);
      } else {
        console.log(`❌ Action ${action?.name} failed: ${error}`);
      }
    } catch (err) {
      console.error(`💥 [ExperienceAgent] Error:`, err);
      success = false;
      error = (err as Error).message;
    }

    const duration = Date.now() - start;
    const newState = this.worldModel.getState();

    // 3. 计算 Reward
    const reward = success ? 1.0 : -0.5;

    // 4. 记录 Episode
    const outcome: Outcome = {
      success,
      reward,
      newState,
      error
    };

    const episode = this.episodeDB.record(
      goal,
      startContext,
      action || { name: "unknown", parameters: {} },
      outcome,
      duration
    );

    // 5. 学习 Rule
    if (success && action) {
      this.ruleLearner.learnFromEpisode(episode);
    }

    // 6. Policy Learning
    this.policyLearner.learn(stateFeatures, strategy, reward);

    this.eventBus.publish("episode.completed", {
      episodeId: episode.id,
      success,
      strategy,
      reward
    });

    return { success, strategy, episode };
  }

  private async executeStrategy(
    strategy: Strategy,
    goal: GoalSpec,
    context: Context
  ): Promise<{
    success: boolean;
    action?: ActionSpec;
    error?: string;
  }> {
    switch (strategy) {
      case Strategy.RULE:
        return this.executeRuleStrategy(context);
      case Strategy.EPISODE_REUSE:
        return this.executeEpisodeStrategy(goal, context);
      case Strategy.PLANNER:
      default:
        return this.executePlannerStrategy(goal);
    }
  }

  private async executeRuleStrategy(context: Context): Promise<{
    success: boolean;
    action?: ActionSpec;
    error?: string;
  }> {
    const rules = this.ruleLearner.findMatchingRules(context);

    if (rules.length === 0) {
      console.log("⚠️ No rules found, falling back to planner");
      return { success: false, error: "No matching rules" };
    }

    const rule = rules[0];
    console.log(`📦 Using rule: ${rule.name}`);

    const result = await this.executeActionByName(rule.actionName);

    if (result.success) {
      this.ruleLearner.recordRuleUsage(rule.id, true);
    }

    return result;
  }

  private async executeEpisodeStrategy(
    goal: GoalSpec,
    context: Context
  ): Promise<{
    success: boolean;
    action?: ActionSpec;
    error?: string;
  }> {
    const similarEpisodes = this.episodeDB.retrieveSimilar(goal, context, 5);

    // 只选成功的 Episode
    const successfulEpisodes = similarEpisodes.filter(e => e.outcome.success);

    if (successfulEpisodes.length === 0) {
      console.log("⚠️ No successful similar episodes found, falling back to planner");
      return this.executePlannerStrategy(goal);
    }

    const bestEpisode = successfulEpisodes[0];
    console.log(`🔄 Reusing SUCCESSFUL episode: ${bestEpisode.id}`);
    console.log(`   Action: ${bestEpisode.action.name}`);

    return this.executeActionByName(bestEpisode.action.name);
  }

  private async executePlannerStrategy(
    goal: GoalSpec
  ): Promise<{
    success: boolean;
    action?: ActionSpec;
    error?: string;
  }> {
    console.log("📐 Using planner");

    let actionName: string;

    if (goal.entity === "booking" && goal.field === "status" && goal.value === "cancelled") {
      actionName = "booking.cancel";
    } else if (goal.entity === "payment" && goal.field === "status" && goal.value === "refunded") {
      actionName = "payment.refund";
    } else {
      return { success: false, error: "Unknown goal" };
    }

    return this.executeActionByName(actionName);
  }

  private async executeActionByName(
    actionName: string
  ): Promise<{
    success: boolean;
    action?: ActionSpec;
    error?: string;
  }> {
    console.log(`⚡ Executing: ${actionName}`);

    if (actionName === "booking.cancel") {
      const result = await this.bookingExecutor.cancel(this.config.bookingId);
      if (result.success && result.booking) {
        this.worldModel.setEntity("booking", result.booking);
      }
      return {
        success: result.success,
        action: { name: "booking.cancel", parameters: { bookingId: this.config.bookingId } },
        error: result.error
      };
    }

    if (actionName === "payment.refund") {
      const result = await this.paymentExecutor.refund(this.config.paymentId);
      if (result.success && result.payment) {
        this.worldModel.setEntity("payment", result.payment);
      }
      return {
        success: result.success,
        action: { name: "payment.refund", parameters: { paymentId: this.config.paymentId } },
        error: result.error
      };
    }

    return { success: false, error: `Unknown action: ${actionName}` };
  }

  private extractContext(state: any): Context {
    return {
      booking: this.bookingExecutor.getState(this.config.bookingId),
      payment: this.paymentExecutor.getState(this.config.paymentId)
    };
  }

  private extractStateFeatures(goal: GoalSpec, context: Context): StateFeatures {
    return {
      goalType: `${goal.entity}:${goal.field}`,
      bookingStatus: context.booking?.status,
      paymentMethod: context.payment?.method,
      channel: context.booking?.channel
    };
  }

  printStatus(): void {
    console.log("\n" + "=".repeat(100));
    console.log("📊 [ExperienceAgent] Status");
    console.log("=".repeat(100));

    console.log("\n📚 Episodes:");
    console.log(JSON.stringify(this.episodeDB.getStats(), null, 2));

    console.log("\n📦 Rules:");
    console.log(JSON.stringify(this.ruleLearner.getStats(), null, 2));

    console.log("\n🎯 Policy:");
    console.log(JSON.stringify(this.policyLearner.getStats(), null, 2));

    console.log("\n🌍 World State:");
    console.log(JSON.stringify(this.worldModel.getState(), null, 2));
  }
}
