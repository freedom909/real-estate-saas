
import { Intent, ParseResult } from "../planner/goal.parser";
import { WorldState, GoalState } from "../state/world-state";
import { WorldStateObserver, InMemoryDataSource } from "../state/world-state-observer";
import { MemoryStore } from "../memory/memory-store";
import { ActivationWorkingMemory } from "../memory/activation-working-memory";
import { SemanticGraph } from "../memory/semantic-graph";
import { EpisodicMemory, Episode } from "../memory/episodic-memory";
import { ProductionMemory, ProductionRule } from "../memory/production-memory";
import { HTNSkillLibrary } from "../memory/htn-skill-library";
import { BeliefLayer } from "../memory/belief-layer";
import { ReflectionEngine, Lesson, Reflection } from "../learning/reflection-engine";
import { SemanticLayer } from "../semantic/semantic-extractor";
import { ExecutorRegistry } from "../factory/executor.registry";
import { MetaCognitiveController, ExecutionMode, MetaDecision } from "../meta-cognition/meta-cognitive-controller";

export interface AgentOSv5Result {
  success: boolean;
  iterations: number;
  modeUsed: ExecutionMode;
  episode?: Episode;
  reflection?: Reflection;
  newRule?: ProductionRule;
}

/**
 * AgentOS v5 - Learning Cognitive Agent
 *
 * 这是一个学习型认知 Agent，不是经典的 SOAR/ACT-R/OpenCog，但有完整的：
 * - Episode Memory（情景记忆）
 * - Reflection（反思）
 * - Production Learning（生产规则学习）
 * - Meta-Cognition（元认知）
 */
export class AgentOSv5 {
  public semanticLayer: SemanticLayer;
  public memoryStore: MemoryStore;
  public workingMemory: ActivationWorkingMemory;
  public semanticGraph: SemanticGraph;
  public episodicMemory: EpisodicMemory;
  public beliefLayer: BeliefLayer;
  public productionMemory: ProductionMemory;
  public skillLibrary: HTNSkillLibrary;
  public reflectionEngine: ReflectionEngine;
  public metaController: MetaCognitiveController;
  public worldObserver: WorldStateObserver;
  public executorRegistry: ExecutorRegistry;

  private maxIterations: number = 100;
  private learningEnabled: boolean = true;

  constructor() {
    this.semanticLayer = new SemanticLayer();
    this.memoryStore = new MemoryStore();
    this.workingMemory = new ActivationWorkingMemory();
    this.semanticGraph = new SemanticGraph();
    this.episodicMemory = new EpisodicMemory();
    this.beliefLayer = new BeliefLayer();
    this.productionMemory = new ProductionMemory();
    this.skillLibrary = new HTNSkillLibrary();
    this.reflectionEngine = new ReflectionEngine();
    this.metaController = new MetaCognitiveController();
    this.worldObserver = new WorldStateObserver();
    this.executorRegistry = new ExecutorRegistry();

    this.initializeBasicConcepts();
    this.registerDefaultExecutors();
  }

  private initializeBasicConcepts(): void {
    this.semanticGraph.addConcept("Human", 0.95);
    this.semanticGraph.addConcept("Customer", 0.9);
    this.semanticGraph.addConcept("Booking", 0.9);
    this.semanticGraph.addConcept("Payment", 0.9);
    this.semanticGraph.addConcept("Refund", 0.85);
  }

  private registerDefaultExecutors(): void {
    const createExecutor = (name: string, successRate: number = 0.9) => {
      return class {
        async execute() {
          const success = Math.random() < successRate;
          return {
            success,
            [`${name}Id`]: `${name}-${Date.now()}`
          };
        }
      };
    };

    this.executorRegistry.register("booking.cancel", createExecutor("cancel"));
    this.executorRegistry.register("payment.refund", createExecutor("refund", 0.6));
    this.executorRegistry.register("listing.release", createExecutor("release"));
  }

  async run(intent: Intent, initialState: WorldState): Promise<AgentOSv5Result> {
    console.log("\n" + "=".repeat(100));
    console.log("🧠 AGENTOS v5 - Learning Cognitive Agent");
    console.log("=".repeat(100));

    const dataSource = new InMemoryDataSource();
    Object.entries(initialState).forEach(([entity, data]) => {
      dataSource.setEntityData(entity, data);
    });
    this.worldObserver.registerDataSource(dataSource);
    this.workingMemory.updateFromWorldState(initialState);

    const goal: GoalState = {
      entity: intent.parameters.entity,
      field: intent.parameters.field,
      value: intent.parameters.value,
      operator: "eq"
    };
    
    console.log(`🎯 Goal: ${goal.entity}.${goal.field} = ${goal.value}`);

    let iterations = 0;
    let lastMode: ExecutionMode = ExecutionMode.PLANNER;
    let episode: Episode | undefined;
    let reflection: Reflection | undefined;
    let newRule: ProductionRule | undefined;

    const startTime = Date.now();

    while (iterations < this.maxIterations) {
      iterations++;
      const currentState = await this.worldObserver.getState();

      if (this.isGoalAchieved(goal, currentState)) {
        console.log(`✅ Goal achieved in ${iterations} iterations!`);
        break;
      }

      console.log(`\n🔄 Iteration ${iterations}`);

      const metaDecision = this.selectExecutionMode(goal, currentState);
      lastMode = metaDecision.mode;

      console.log(`🤔 Meta-Cognitive Decision: ${metaDecision.mode} (confidence: ${metaDecision.confidence.toFixed(2)})`);
      console.log(`   Reasoning: ${metaDecision.reasoning}`);

      const actionResult = await this.executeMode(metaDecision.mode, goal, currentState);

      if (this.learningEnabled && actionResult.action) {
        const duration = Date.now() - startTime;
        const reward = actionResult.success ? 1.0 : -0.5;

        const newState = await this.worldObserver.getState();
        episode = this.episodicMemory.recordEpisode(
          goal,
          currentState,
          actionResult.action,
          {
            success: actionResult.success,
            newState,
            reward
          },
          duration
        );

        console.log(`📝 Recorded Episode: ${episode.id}`);

        reflection = this.reflectionEngine.reflect(episode);
        console.log(`💭 Reflection: ${reflection.summary}`);

        if (reflection.lessons.length > 0) {
          for (const lesson of reflection.lessons) {
            const rule = this.productionMemory.createRuleFromLesson(lesson);
            if (rule) {
              newRule = rule;
              console.log(`📦 Learned Production Rule: ${rule.name}`);
            }
          }
        }

        this.metaController.recordModePerformance(metaDecision.mode, actionResult.success);
      }

      await this.delay(100);
    }

    return {
      success: true,
      iterations,
      modeUsed: lastMode,
      episode,
      reflection,
      newRule
    };
  }

  private selectExecutionMode(goal: GoalState, state: WorldState): MetaDecision {
    const matchingRules = this.productionMemory.findMatchingRules(state);
    const skills = this.skillLibrary.findSkillsMatchingGoal(goal);

    return this.metaController.decideMode(goal, state, matchingRules, skills);
  }

  private async executeMode(
    mode: ExecutionMode,
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action?: { name: string; parameters: Record<string, any> } }> {
    switch (mode) {
      case ExecutionMode.PRODUCTION:
        return this.executeProductionMode(goal, state);
      case ExecutionMode.SKILL:
        return this.executeSkillMode(goal, state);
      case ExecutionMode.PLANNER:
        return this.executePlannerMode(goal, state);
      default:
        return this.executePlannerMode(goal, state);
    }
  }

  private async executeProductionMode(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action?: { name: string; parameters: Record<string, any> } }> {
    const matchingRules = this.productionMemory.findMatchingRules(state);
    if (matchingRules.length === 0) {
      return { success: false };
    }

    const rule = this.productionMemory.selectRule(matchingRules)!;
    console.log(`⚙️ Using Production Rule: ${rule.name}`);

    for (const action of rule.actions) {
      const executor = this.executorRegistry.create(action.name);
      if (executor) {
        const result = await executor.execute(action.parameters);
        this.productionMemory.recordRuleUsage(rule, result.success);
        return { success: result.success, action: { name: action.name, parameters: action.parameters } };
      }
    }

    return { success: false };
  }

  private async executeSkillMode(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action?: { name: string; parameters: Record<string, any> } }> {
    const skills = this.skillLibrary.findSkillsMatchingGoal(goal);
    if (skills.length === 0) {
      return { success: false };
    }

    const skill = skills[0];
    console.log(`🛠️ Using Skill: ${skill.name}`);

    return { success: Math.random() < skill.successRate, action: { name: skill.name, parameters: {} } };
  }

  private async executePlannerMode(
    goal: GoalState,
    state: WorldState
  ): Promise<{ success: boolean; action?: { name: string; parameters: Record<string, any> } }> {
    console.log(`📐 Using Planner`);

    let actionName = "booking.cancel";
    if (goal.entity === "payment" && goal.field === "status") {
      actionName = "payment.refund";
    }

    const executor = this.executorRegistry.create(actionName);
    if (executor) {
      const result = await executor.execute({});
      return { success: result.success, action: { name: actionName, parameters: {} } };
    }

    return { success: false };
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
    console.log("📊 AGENTOS v5 - System Status");
    console.log("=".repeat(100));

    console.log("\n📚 Episodic Memory:");
    console.log(JSON.stringify(this.episodicMemory.getEpisodeSummary(), null, 2));

    console.log("\n💭 Reflection Engine:");
    console.log(JSON.stringify(this.reflectionEngine.getReflectionSummary(), null, 2));

    console.log("\n⚙️ Production Memory:");
    console.log(JSON.stringify(this.productionMemory.getProductionSummary(), null, 2));

    console.log("\n🧠 Working Memory:");
    console.log(JSON.stringify(this.workingMemory.getActivationSummary(), null, 2));

    console.log("\n🕸️ Semantic Graph:");
    console.log(JSON.stringify(this.semanticGraph.getGraphSummary(), null, 2));

    console.log("\n🤖 Meta-Cognition:");
    console.log(JSON.stringify(this.metaController.getMetaSummary(), null, 2));
  }
}
