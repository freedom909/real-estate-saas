
import { Intent } from "../planner/goal.parser";
import { WorldState, GoalState } from "../state/world-state";
import { WorldStateObserver, InMemoryDataSource } from "../state/world-state-observer";
import { EpisodicMemory, Episode, EpisodeFilter } from "../memory/episodic-memory";
import { ProductionMemory, ProductionRule, WMElement, ProductionOperator } from "../memory/production-memory";

export enum Strategy {
  EPISODE_REUSE = "episode_reuse",
  PRODUCTION_RULE = "production_rule",
  PLANNER = "planner"
}

export interface PolicyStats {
  [Strategy.EPISODE_REUSE]: { attempts: number; successes: number; avgTime: number };
  [Strategy.PRODUCTION_RULE]: { attempts: number; successes: number; avgTime: number };
  [Strategy.PLANNER]: { attempts: number; successes: number; avgTime: number };
}

export interface AgentOSv6Result {
  success: boolean;
  strategy: Strategy;
  episode?: Episode;
  ruleUsed?: ProductionRule;
  iterations: number;
}

/**
 * AgentOS v6 - Experience-Driven Agent
 *
 * 核心：从业务经验中学习
 *
 * 1. Goal → Episode Retrieval → Reuse → Adapt
 * 2. Episode → Rule Extraction → Production Memory
 * 3. Policy Learning（基于真实成功率）
 *
 * 不再堆认知概念，只做有用的东西
 */
export class AgentOSv6 {
  public episodicMemory: EpisodicMemory;
  public productionMemory: ProductionMemory;
  public worldObserver: WorldStateObserver;
  public policyStats: PolicyStats;

  private maxIterations: number = 50;
  private explorationRate: number = 0.2; // 探索率

  constructor() {
    this.episodicMemory = new EpisodicMemory();
    this.productionMemory = new ProductionMemory();
    this.worldObserver = new WorldStateObserver();
    this.policyStats = {
      [Strategy.EPISODE_REUSE]: { attempts: 0, successes: 0, avgTime: 0 },
      [Strategy.PRODUCTION_RULE]: { attempts: 0, successes: 0, avgTime: 0 },
      [Strategy.PLANNER]: { attempts: 0, successes: 0, avgTime: 0 }
    };
  }

  async run(intent: Intent, initialState: WorldState): Promise<AgentOSv6Result> {
    console.log("\n" + "=".repeat(100));
    console.log("🚀 AGENTOS v6 - Experience-Driven Agent");
    console.log("=".repeat(100));

    const dataSource = new InMemoryDataSource();
    Object.entries(initialState).forEach(([entity, data]) => {
      dataSource.setEntityData(entity, data);
    });
    this.worldObserver.registerDataSource(dataSource);

    const goal: GoalState = {
      entity: intent.parameters.entity,
      field: intent.parameters.field,
      value: intent.parameters.value,
      operator: "eq"
    };

    console.log(`\n🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);
    console.log(`🌍 Initial State:`, initialState);

    const startAll = Date.now();
    let iterations = 0;
    let finalStrategy: Strategy | undefined;
    let usedEpisode: Episode | undefined;
    let usedRule: ProductionRule | undefined;

    while (iterations < this.maxIterations) {
      iterations++;
      const currentState = await this.worldObserver.getState();

      if (this.isGoalAchieved(goal, currentState)) {
        console.log(`\n✅ Goal achieved in ${iterations} iterations!`);
        break;
      }

      console.log(`\n🔄 Iteration ${iterations}`);

      const strategy = this.selectStrategy(goal, currentState);
      finalStrategy = strategy;

      console.log(`🎯 Strategy: ${strategy}`);

      const startTime = Date.now();
      let result: { success: boolean; action: any; newState?: WorldState };

      switch (strategy) {
        case Strategy.EPISODE_REUSE:
          result = await this.executeEpisodeReuse(goal, currentState);
          usedEpisode = result.action as Episode;
          break;
        case Strategy.PRODUCTION_RULE:
          result = await this.executeProductionRule(goal, currentState);
          usedRule = result.action as ProductionRule;
          break;
        case Strategy.PLANNER:
        default:
          result = await this.executePlanner(goal, currentState);
      }

      const duration = Date.now() - startTime;
      this.recordStrategyResult(strategy, result.success, duration);

      if (result.success) {
        const episode = this.episodicMemory.recordEpisode(
          goal,
          currentState,
          { name: result.action.name, parameters: result.action.parameters },
          {
            success: true,
            newState: result.newState || currentState,
            reward: 1.0
          },
          duration
        );

        console.log(`📝 Recorded Episode: ${episode.id}`);

        this.extractRuleFromEpisode(episode);

        if (result.newState) {
          this.updateWorldState(result.newState);
        }

        break;
      }

      await this.delay(100);
    }

    const finalState = await this.worldObserver.getState();
    const success = this.isGoalAchieved(goal, finalState);

    return {
      success,
      strategy: finalStrategy || Strategy.PLANNER,
      episode: usedEpisode,
      ruleUsed: usedRule,
      iterations
    };
  }

  private selectStrategy(goal: GoalState, state: WorldState): Strategy {
    const similarEpisodes = this.episodicMemory.findSimilarEpisodes(goal, state);
    const matchingRules = this.productionMemory.findMatchingRules(state);

    const episodeSuccess = this.getStrategySuccessRate(Strategy.EPISODE_REUSE);
    const ruleSuccess = this.getStrategySuccessRate(Strategy.PRODUCTION_RULE);
    const plannerSuccess = this.getStrategySuccessRate(Strategy.PLANNER);

    console.log(`   📊 Policy Stats:`);
    console.log(`      Episode Reuse: ${(episodeSuccess * 100).toFixed(1)}% (${this.policyStats[Strategy.EPISODE_REUSE].attempts} attempts)`);
    console.log(`      Production Rule: ${(ruleSuccess * 100).toFixed(1)}% (${this.policyStats[Strategy.PRODUCTION_RULE].attempts} attempts)`);
    console.log(`      Planner: ${(plannerSuccess * 100).toFixed(1)}% (${this.policyStats[Strategy.PLANNER].attempts} attempts)`);

    if (Math.random() < this.explorationRate) {
      const strategies = Object.values(Strategy);
      return strategies[Math.floor(Math.random() * strategies.length)];
    }

    let bestStrategy = Strategy.PLANNER;
    let bestScore = plannerSuccess;

    if (similarEpisodes.length > 0) {
      const episodeScore = episodeSuccess * 0.6 + (Math.min(similarEpisodes.length, 5) * 0.08);
      if (episodeScore > bestScore) {
        bestScore = episodeScore;
        bestStrategy = Strategy.EPISODE_REUSE;
      }
    }

    if (matchingRules.length > 0) {
      const ruleScore = ruleSuccess * 0.5 + (matchingRules[0].utility * 0.3);
      if (ruleScore > bestScore) {
        bestScore = ruleScore;
        bestStrategy = Strategy.PRODUCTION_RULE;
      }
    }

    return bestStrategy;
  }

  private async executeEpisodeReuse(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action: any; newState?: WorldState }> {
    const similarEpisodes = this.episodicMemory.findSimilarEpisodes(goal, state);
    if (similarEpisodes.length === 0) {
      return { success: false, action: null };
    }

    const bestEpisode = similarEpisodes[0];
    console.log(`   🔄 Reusing Episode: ${bestEpisode.id}`);
    console.log(`      Action: ${bestEpisode.action.name}`);
    console.log(`      Previous Success: ${bestEpisode.outcome.success}`);

    return this.executeAction(bestEpisode.action.name, bestEpisode.action.parameters);
  }

  private async executeProductionRule(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action: any; newState?: WorldState }> {
    const matchingRules = this.productionMemory.findMatchingRules(state);
    if (matchingRules.length === 0) {
      return { success: false, action: null };
    }

    const rule = this.productionMemory.selectRule(matchingRules)!;
    console.log(`   ⚙️ Using Production Rule: ${rule.name}`);

    if (rule.actions.length > 0) {
      const result = await this.executeAction(rule.actions[0].name, rule.actions[0].parameters);
      this.productionMemory.recordRuleUsage(rule, result.success);
      return result;
    }

    return { success: false, action: rule };
  }

  private async executePlanner(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action: any; newState?: WorldState }> {
    console.log(`   📐 Using Planner`);

    let actionName = "booking.cancel";
    if (goal.entity === "payment" && goal.field === "status") {
      actionName = "payment.refund";
    }
    if (goal.entity === "listing" && goal.field === "available") {
      actionName = "listing.release";
    }

    return this.executeAction(actionName, {});
  }

  private async executeAction(
    name: string,
    parameters: Record<string, any>
  ): Promise<{ success: boolean; action: { name: string; parameters: Record<string, any> }; newState?: WorldState }> {
    console.log(`   ⚡ Executing: ${name}`);

    let success = true;
    if (name === "payment.refund") {
      success = Math.random() < 0.7;
    } else {
      success = Math.random() < 0.95;
    }

    let newState: WorldState | undefined;
    if (success) {
      newState = this.simulateStateChange(name);
    }

    console.log(`      Result: ${success ? "✅ Success" : "❌ Failed"}`);

    return {
      success,
      action: { name, parameters },
      newState
    };
  }

  private simulateStateChange(actionName: string): WorldState {
    const newState: WorldState = {};
    if (actionName === "booking.cancel") {
      newState.booking = { status: "cancelled" };
    }
    if (actionName === "payment.refund") {
      newState.payment = { status: "refunded" };
    }
    if (actionName === "listing.release") {
      newState.listing = { available: true };
    }
    return newState;
  }

  private updateWorldState(newState: WorldState): void {
    const dataSources = this.worldObserver["dataSources"] || [];
    for (const [entity, data] of Object.entries(newState)) {
      for (const ds of dataSources) {
        if (ds.name === "in-memory" && ds instanceof InMemoryDataSource) {
          const current = ds.getEntityData(entity) || {};
          ds.setEntityData(entity, { ...current, ...data });
        }
      }
    }
    this.worldObserver.invalidateCache();
  }

  private extractRuleFromEpisode(episode: Episode): void {
    if (!episode.outcome.success) return;

    const conditions: WMElement[] = [];
    for (const [entity, entityData] of Object.entries(episode.state)) {
      for (const [field, value] of Object.entries(entityData)) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          conditions.push({
            entity,
            field,
            value,
            operator: "eq"
          });
        }
      }
    }

    const limitedConditions = conditions.slice(0, 3);

    const rule = this.productionMemory.createRule(
      `learned:${episode.id.substring(0, 15)}`,
      limitedConditions,
      [episode.action]
    );

    console.log(`   📦 Extracted Rule: ${rule.name}`);
  }

  private recordStrategyResult(strategy: Strategy, success: boolean, duration: number): void {
    const stats = this.policyStats[strategy];
    stats.attempts++;
    if (success) {
      stats.successes++;
    }

    const totalDuration = stats.avgTime * (stats.attempts - 1) + duration;
    stats.avgTime = totalDuration / stats.attempts;
  }

  private getStrategySuccessRate(strategy: Strategy): number {
    const stats = this.policyStats[strategy];
    if (stats.attempts === 0) return 0.3;
    return stats.successes / stats.attempts;
  }

  private isGoalAchieved(goal: GoalState, state: WorldState): boolean {
    const entityState = state[goal.entity];
    if (!entityState) return false;
    return entityState[goal.field] === goal.value;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSystemStatus(): void {
    console.log("\n" + "=".repeat(100));
    console.log("📊 AGENTOS v6 - System Status");
    console.log("=".repeat(100));

    console.log("\n📚 Episodic Memory:");
    console.log(JSON.stringify(this.episodicMemory.getEpisodeSummary(), null, 2));

    console.log("\n⚙️ Production Memory:");
    console.log(JSON.stringify(this.productionMemory.getProductionSummary(), null, 2));

    console.log("\n🎯 Policy Stats:");
    for (const [strategy, stats] of Object.entries(this.policyStats)) {
      const rate = stats.attempts > 0 ? (stats.successes / stats.attempts * 100).toFixed(1) : "0";
      console.log(`   ${strategy}: ${rate}% (${stats.attempts} attempts, avg ${Math.round(stats.avgTime)}ms)`);
    }
  }
}
