
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
import { ActionScore, computeFinalActionScore, ExperiencePrior } from "../learning/action-score";
import { StateEncoderV2 } from "../reasoning/state-encoder";
import { IBandit } from "../learning/i-bandit";
import { TabularBanditAdapter } from "../learning/tabular-bandit-adapter";
import { LinUCBBandit } from "../learning/linucb-bandit";

export interface AlphaGoStyleAgentConfig {
  bookingId: string;
  paymentId: string;
  banditType?: "tabular" | "linucb";
  priorLambda?: number;
}

export class AlphaGoStyleAgent {
  // 核心模块
  private episodeDB: EpisodeDatabase;
  private episodeVectorDB: EpisodeVectorDB;
  private bandit: IBandit;
  private environment: RealisticEnvironment;
  private actionSpace: ParameterizedActionSpace;
  private stateEncoder: StateEncoderV2;
  private priorLambda: number;
  private banditType: "tabular" | "linucb";

  private initialState: EnvironmentState;

  constructor(config: AlphaGoStyleAgentConfig) {
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
    this.stateEncoder = new StateEncoderV2();
    this.banditType = config.banditType ?? "tabular";
    this.bandit = this.createBandit(this.banditType);
    this.priorLambda = config.priorLambda ?? (this.banditType === "linucb" ? 0.1 : 0.3);
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
    const stateVector = this.stateEncoder.encode(currentState).values;
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

    const priors = this.episodeVectorDB.getExperiencePriors(similarEpisodes);
    if (priors.size > 0) {
      console.log(`    Experience Priors:`);
      for (const [action, prior] of priors) {
        console.log(`      ${action}: attempts=${prior.attempts}, success=${(prior.successRate * 100).toFixed(0)}%, reward=${prior.avgReward.toFixed(3)}, conf=${prior.confidence.toFixed(2)}`);
      }
    }

    // ===== Step 3: 生成候选动作（参数化！）=====
    console.log(`\n🎲 Step 2: Generating Parameterized Candidate Actions...`);
    const candidateActions = this.actionSpace.generateCandidateActions();
    console.log(`    Generated ${candidateActions.length} candidate actions`);

    // ===== Step 4: Contextual Bandit 选择动作（Q-learning！）=====
    console.log(`\n🧠 Step 3: Contextual Bandit Decision (Q-learning)...`);
    const actionKeys = candidateActions.map(action => toActionKey(action));
    const banditDecision = this.bandit.selectAction(stateVector, actionKeys);
    const actionScores = this.scoreActions(stateVector, actionKeys, priors);
    const hasPrior = actionScores.some(score => score.priorConfidence > 0);
    const selectedActionKey = banditDecision.explored || !hasPrior
      ? banditDecision.action
      : actionScores[0].actionKey;

    const selectedAction = candidateActions.find(action => toActionKey(action) === selectedActionKey) || candidateActions[0];
    const selectedActionScore = actionScores.find(score => score.actionKey === selectedActionKey);

    console.log(`    Top Scores:`);
    actionScores.slice(0, 3).forEach((score, index) => {
      console.log(`      ${index + 1}. ${score.actionKey} -> Q=${score.banditQ.toFixed(3)}, prior=${score.priorReward.toFixed(3)}, conf=${score.priorConfidence.toFixed(2)}, final=${score.finalScore.toFixed(3)}`);
    });
    console.log(`    Selected: ${selectedAction.name} [${selectedActionKey}] (${banditDecision.explored ? "explore" : hasPrior ? "prior-fused" : "bandit"}, final=${selectedActionScore?.finalScore.toFixed(3) ?? banditDecision.value.toFixed(3)})`);

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
        name: selectedActionKey,
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
    this.bandit.update(stateVector, selectedActionKey, outcome.reward);
    this.bandit.decayExploration?.();

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
    console.log(`\n🎰 Bandit (${this.banditType}):`);
    console.log(JSON.stringify(this.bandit.getStats(), null, 2));

    // Vector DB Stats
    console.log(`\n🔢 Episode Vector DB:`);
    console.log(`    Total Episodes: ${this.episodeVectorDB.size()}`);
  }

  reset(): void {
    this.environment.reset(this.initialState);
  }

  private scoreActions(
    stateVector: number[],
    actionKeys: string[],
    priors: Map<string, ExperiencePrior>
  ): ActionScore[] {
    const scores = actionKeys.map(actionKey => {
      const banditQ = this.bandit.estimateValue(stateVector, actionKey);
      const prior = priors.get(actionKey);

      return computeFinalActionScore({
        actionKey,
        banditQ,
        priorReward: prior?.avgReward ?? 0,
        priorConfidence: prior?.confidence ?? 0,
        lambda: this.priorLambda,
      });
    });

    scores.sort((left, right) => right.finalScore - left.finalScore);
    return scores;
  }

  private createBandit(type: "tabular" | "linucb"): IBandit {
    if (type === "linucb") {
      const dimensions = this.stateEncoder.encode(this.initialState).values.length;
      return new LinUCBBandit({
        dimensions,
        alpha: 1.0,
      });
    }

    return new TabularBanditAdapter(new ContextualBandit());
  }
}
