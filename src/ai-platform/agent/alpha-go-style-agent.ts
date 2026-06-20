
/**
 * AlphaGo-Style Experience-Driven Agent
 *
 * 完整的升级架构！
 *
 * 1. ✅ State Vector Retrieval (cosineSimilarity)
 * 2. ✅ Contextual Bandit (Q-learning)
 * 3. ✅ Environment-Generated Reward
 * 4. ✅ Parameterized Action Space
 *
 * 这才是真正的经验学习 Agent！
 */

import { EpisodeDatabase, EpisodeRecord, GoalSpec, Context, ActionSpec } from "../memory/episodic/episode-record";
import { EpisodeVectorDB } from "../memory/episode-vector-db";
import { ContextualBandit } from "../learning/contextual-bandit";
import { RealisticEnvironment, EnvironmentState, EnvironmentOutcome } from "../environment/environment";
import { ParameterizedActionSpace, ParameterizedAction, toActionKey } from "../action/parameterized-actions";

export class AlphaGoStyleAgent {
  // 核心模块
  private episodeDB: EpisodeDatabase;
  private episodeVectorDB: EpisodeVectorDB;
  private bandit: ContextualBandit;
  private environment: RealisticEnvironment;
  private actionSpace: ParameterizedActionSpace;

  private initialState: EnvironmentState;

  constructor(config: { bookingId: string; paymentId: string }) {
    // 初始化状态
    this.initialState = {
      booking: {
        id: config.bookingId,
        status: "confirmed",
        channel: "airbnb",
        hoursBeforeCheckin: 48,
        amount: 15000,
        customerLoyaltyTier: "silver",
        previousCancellations: 0
      },
      payment: {
        id: config.paymentId,
        method: "credit_card",
        status: "paid",
        amount: 15000
      }
    };

    // 初始化模块
    this.episodeDB = new EpisodeDatabase();
    this.episodeVectorDB = new EpisodeVectorDB();
    this.bandit = new ContextualBandit();
    this.environment = new RealisticEnvironment(this.initialState);
    this.actionSpace = new ParameterizedActionSpace();
  }

  /**
   * 主循环 - 真正的经验学习！
   */
  async runEpisode(goal: GoalSpec, episodeNumber: number): Promise<{
    success: boolean;
    reward: number;
    action: ParameterizedAction;
  }> {
    console.log(`\n` + "=".repeat(120));
    console.log(`🚀 Episode ${episodeNumber} - AlphaGo Style Agent`);
    console.log("=".repeat(120));
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);

    // ===== Step 1: 观察当前状态 =====
    const currentState = this.environment.getState();
    console.log(`\n📊 Current State:`);
    console.log(`    - Booking Status: ${currentState.booking.status}`);
    console.log(`    - Channel: ${currentState.booking.channel}`);
    console.log(`    - Hours Before Checkin: ${currentState.booking.hoursBeforeCheckin}`);

    // ===== Step 2: 检索相似经验（真正的向量检索！）=====
    console.log(`\n🔍 Step 1: Retrieving Similar Experiences (Vector Search)...`);
    const similarEpisodes = this.episodeVectorDB.retrieveSimilar(
      currentState,
      5,
      { goalEntity: goal.entity, successOnly: true }
    );

    const expStats = this.episodeVectorDB.getExperienceStats(similarEpisodes);
    if (expStats.size > 0) {
      console.log(`    Experience Stats:`);
      for (const [action, stats] of expStats) {
        const successRate = (stats.successes / stats.attempts * 100).toFixed(0);
        console.log(`      ${action}: ${stats.attempts} attempts, ${successRate}% success, avg reward=${stats.avgReward.toFixed(3)}`);
      }
    }

    // ===== Step 3: 生成候选动作（参数化！）=====
    console.log(`\n🎲 Step 2: Generating Parameterized Candidate Actions...`);
    const candidateActions = this.actionSpace.generateCandidateActions();
    console.log(`    Generated ${candidateActions.length} candidate actions`);

    // ===== Step 4: Contextual Bandit 选择动作（Q-learning！）=====
    console.log(`\n🧠 Step 3: Contextual Bandit Decision (Q-learning)...`);
    const stateKey = this.bandit.getStateKey(currentState);
    const actionKeys = candidateActions.map(action => toActionKey(action));
    const { action: selectedActionKey, qValue, explored } = this.bandit.selectAction(stateKey, actionKeys);

    // 找到对应的完整动作
    const selectedAction = candidateActions.find(action => toActionKey(action) === selectedActionKey) || candidateActions[0];
    const selectedActionKeyForLog = toActionKey(selectedAction);

    console.log(`    Selected: ${selectedAction.name} [${selectedActionKeyForLog}] (Q=${qValue.toFixed(3)}, ${explored ? "explore" : "exploit"})`);

    // ===== Step 5: 在环境中执行 =====
    console.log(`\n⚡ Step 4: Executing in Realistic Environment...`);
    const outcome = this.environment.execute({
      actionType: selectedAction.type,
      parameters: selectedAction.parameters
    });

    console.log(`    Success: ${outcome.success ? "✅" : "❌"}`);
    console.log(`    Reward: ${outcome.reward.toFixed(3)}`);
    console.log(`    Details: Satisfaction=${outcome.details.guestSatisfaction.toFixed(2)}, Revenue=${outcome.details.revenueImpact}, Risk=${outcome.details.reviewRisk.toFixed(2)}`);

    // ===== Step 6: 记录 Episode =====
    console.log(`\n📝 Step 5: Recording Episode...`);
    const episode = this.episodeDB.record(
      goal,
      currentState as any,
      {
        name: selectedActionKeyForLog,
        parameters: {
          actionType: selectedAction.type,
          ...selectedAction.parameters
        }
      },
      {
        success: outcome.success,
        reward: outcome.reward,
        newState: this.environment.getState()
      },
      0
    );

    this.episodeVectorDB.add(episode);

    // ===== Step 7: 学习（Q 更新！）=====
    console.log(`\n🎓 Step 6: Learning from Outcome...`);
    this.bandit.updateQ(stateKey, selectedActionKeyForLog, outcome.reward);
    this.bandit.decayEpsilon();

    console.log(`\n✅ Episode ${episodeNumber} Complete`);

    return {
      success: outcome.success,
      reward: outcome.reward,
      action: selectedAction
    };
  }

  printFinalStats(): void {
    console.log(`\n` + "=".repeat(120));
    console.log(`📊 FINAL SYSTEM STATISTICS`);
    console.log("=".repeat(120));

    // Episode Stats
    console.log(`\n📚 Episodes:`);
    console.log(JSON.stringify(this.episodeDB.getStats(), null, 2));

    // Bandit Stats
    console.log(`\n🎰 Contextual Bandit:`);
    console.log(JSON.stringify(this.bandit.getStats(), null, 2));

    // Vector DB Stats
    console.log(`\n🔢 Episode Vector DB:`);
    console.log(`    Total Episodes: ${this.episodeVectorDB.size()}`);
  }

  reset(): void {
    this.environment.reset(this.initialState);
  }
}
