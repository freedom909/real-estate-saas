import { Intent, ParseResult } from "../planner/goal.parser";
import { GoalRegressionPlannerV2, PlanResult } from "../planner/goal-regression-planner-v2";
import { WorkflowExecutor, Observation } from "../executor/workflow.executor";
import { WorldState, GoalState } from "../state/world-state";
import { WorldStateObserver, InMemoryDataSource } from "../state/world-state-observer";
import { MemoryStore, EpisodicMemory } from "../memory/memory-store";
import { KnowledgeBase } from "../memory/knowledge-base";
import { KnowledgeGraph } from "../memory/knowledge-graph";
import { BeliefLayer } from "../memory/belief-layer";
import { MetaCognitionLayer, MetaCognitionDecision } from "../meta-cognition/meta-cognition-layer";
import { AsyncLearningPipeline } from "../learning/async-learning-pipeline";
import { SemanticLayer } from "../semantic/semantic-extractor";
import { ExecutorRegistry } from "../factory/executor.registry";

export interface AgentOSv3Result {
  success: boolean;
  finalState: WorldState;
  observations: Observation[];
  iterations: number;
  reasoningTrace: string[];
  userGoal: GoalState[];
  agentGoal: GoalState[];
  memorySummary: any;
  knowledgeSummary: any;
  beliefSummary: any;
  metaCognitionSummary: any;
  learningSummary: any;
  plan?: PlanResult;
  goal?: ParseResult;
  metaDecision?: MetaCognitionDecision;
}

export class AgentOSv3 {
  public semanticLayer: SemanticLayer;
  public memory: MemoryStore;
  public knowledgeBase: KnowledgeBase;
  public knowledgeGraph: KnowledgeGraph;
  public beliefLayer: BeliefLayer;
  public metaCognition: MetaCognitionLayer;
  public observer: WorldStateObserver;
  public executorRegistry: ExecutorRegistry;
  public learningPipeline: AsyncLearningPipeline;

  // 目标分离：User Goal (Immutable) vs Agent Goal (Mutable)
  private userGoal: GoalState[] = [];
  private agentGoal: GoalState[] = [];
  private currentPlan: PlanResult | undefined;

  private maxOODAIterations: number = 20;

  constructor() {
    this.semanticLayer = new SemanticLayer();
    this.memory = new MemoryStore();
    this.knowledgeBase = new KnowledgeBase(this.memory);
    this.knowledgeGraph = new KnowledgeGraph();
    this.beliefLayer = new BeliefLayer();
    this.metaCognition = new MetaCognitionLayer();
    this.observer = new WorldStateObserver();
    this.executorRegistry = new ExecutorRegistry();
    this.learningPipeline = new AsyncLearningPipeline(this.memory, this.knowledgeGraph, this.beliefLayer);
    this.registerDefaultExecutors();
  }

  async run(
    intent: Intent,
    initialState: WorldState = {}
  ): Promise<AgentOSv3Result> {
    console.log("🚀 AgentOS v3 Starting - Complete Cognitive Architecture");
    console.log("=".repeat(80));
    console.log("📝 Intent:", intent);

    // 启动异步学习管道
    this.learningPipeline.start();

    // 初始化数据源
    const dataSource = new InMemoryDataSource();
    Object.entries(initialState).forEach(([entity, data]) => {
      dataSource.setEntityData(entity, data);
    });
    this.observer.registerDataSource(dataSource);

    // === SEMANTIC LAYER ===
    console.log("🎯 [Semantic Layer] Parsing user intent...");
    const parseResult = await this.semanticLayer.extract(intent);
    
    // 设置 USER GOAL（IMMUTABLE！永远不改！）
    this.userGoal = [...parseResult.goalStates];
    // 设置 AGENT GOAL（MUTABLE！可以进化）
    this.agentGoal = [...parseResult.goalStates];

    console.log("✅ [Goal Layer] User Goal (IMMUTABLE):", this.userGoal);
    console.log("✅ [Goal Layer] Agent Goal (MUTABLE):", this.agentGoal);

    const observations: Observation[] = [];
    const reasoningTrace: string[] = [];
    let currentIteration = 0;

    // 存储执行前的状态用于学习
    let stateBeforeExecution = await this.observer.getState();

    try {
      while (currentIteration < this.maxOODAIterations) {
        currentIteration++;
        console.log(`\n🔄 === OODA Iteration ${currentIteration}/${this.maxOODAIterations} ===`);
        
        // === 1. OBSERVE ===
        console.log("👁️ [OODA] Observing world state...");
        const currentState = await this.observer.getState();

        // 检查用户目标是否已经达成
        if (this.areGoalsSatisfied(this.userGoal, currentState)) {
          console.log("🎉 [Goal Layer] USER GOAL ACHIEVED!");
          return this.createSuccessResult(currentState, observations, currentIteration, reasoningTrace, parseResult);
        }

        // === 2. ORIENT ===
        console.log("🧭 [OODA] Orienting to current state...");
        this.memory.updateWorkingMemory({
          currentGoal: this.agentGoal,
          currentPlan: this.currentPlan,
          recentObservations: observations.slice(-10)
        });

        // === 3. META COGNITION ===
        const currentPlanConfidence = this.currentPlan ? 0.8 : 0.6;
        const metaDecision = this.metaCognition.analyzeReasoning(currentPlanConfidence);
        console.log("🤔 [MetaCognition] Decision:", metaDecision);

        if (metaDecision.humanRequired) {
          console.log("⚠️ [MetaCognition] HUMAN INTERVENTION REQUIRED!");
          return this.createHumanInterventionResult(currentState, observations, currentIteration, reasoningTrace, parseResult, metaDecision);
        }

        // === 4. PLANNING (If needed) ===
        if (!this.currentPlan || metaDecision.action === "rethink") {
          console.log("📋 [OODA] Planning from agent goal...");
          const planner = new GoalRegressionPlannerV2(this.observer);
          const goalForPlanning: ParseResult = {
            ...parseResult,
            goalStates: this.agentGoal
          };
          this.currentPlan = await planner.plan(goalForPlanning);
          this.memory.addEpisodicMemory("Plan created", "success", 0.7, { plan: this.currentPlan.executionOrder });
          reasoningTrace.push(`Generated plan: ${this.currentPlan.executionOrder.join(' → ')}`);
          console.log("📊 [Planner] Plan:", this.currentPlan.executionOrder);
        }

        if (!this.currentPlan || this.currentPlan.steps.length === 0) {
          console.log("✅ No actions needed");
          return this.createSuccessResult(currentState, observations, currentIteration, reasoningTrace, parseResult);
        }

        // === 5. ACT ===
        const stepToExecute = this.currentPlan.steps.shift()!;
        console.log(`▶️ [OODA] Executing: ${stepToExecute.capabilityId}`);

        const executor = new WorkflowExecutor(currentState);
        this.copyExecutors(executor.getExecutorRegistry());

        try {
          const obsResult = await executor.executeStep(stepToExecute);
          observations.push(obsResult.observation);
          
          const episode: EpisodicMemory = {
            id: `episode:${Date.now()}`,
            type: "episodic",
            event: `Executed ${stepToExecute.capabilityId}`,
            outcome: obsResult.observation.success ? "success" : "failure",
            content: { observation: obsResult },
            timestamp: Date.now(),
            importance: obsResult.observation.success ? 0.6 : 0.9
          };
          
          // 记录经验
          this.memory.addEpisodicMemory(episode.event, episode.outcome, episode.importance, { step: stepToExecute.capabilityId });
          
          // 提交给学习管道（异步，不阻塞执行）
          const newState = await this.observer.getState();
          this.learningPipeline.submitEpisode(episode, stateBeforeExecution, newState);
          stateBeforeExecution = newState;

          if (obsResult.observation.success) {
            console.log("✅ [Execution] Step success!");
          } else {
            console.log("❌ [Execution] Step failed!");
            reasoningTrace.push(`Step failed: ${stepToExecute.capabilityId}`);
          }
        } catch (error) {
          console.error("💥 [Execution] Error:", error);
          const failureObs: Observation = { success: false, error: error as Error };
          observations.push(failureObs);

          const failureEpisode: EpisodicMemory = {
            id: `episode:${Date.now()}`,
            type: "episodic",
            event: `Error in ${stepToExecute.capabilityId}`,
            outcome: "failure",
            content: { error },
            timestamp: Date.now(),
            importance: 1.0
          };
          
          this.memory.addEpisodicMemory(failureEpisode.event, failureEpisode.outcome, failureEpisode.importance, { error: (error as Error).message });
          const currentStateAfterError = await this.observer.getState();
          this.learningPipeline.submitEpisode(failureEpisode, stateBeforeExecution, currentStateAfterError);
          stateBeforeExecution = currentStateAfterError;

          reasoningTrace.push(`Execution error: ${(error as Error).message}`);
        }
      }

      console.log("⚠️ Max iterations reached");
      const finalState = await this.observer.getState();
      return this.createResult(false, finalState, observations, currentIteration, reasoningTrace, parseResult, "Max iterations reached");

    } finally {
      // 确保学习管道停止
      setTimeout(() => this.learningPipeline.stop(), 5000);
    }
  }

  private areGoalsSatisfied(goals: GoalState[], state: WorldState): boolean {
    return goals.every(goal => {
      const entityState = state[goal.entity];
      return entityState && entityState[goal.field] === goal.value;
    });
  }

  private createSuccessResult(
    finalState: WorldState,
    observations: Observation[],
    iterations: number,
    reasoningTrace: string[],
    goal: ParseResult
  ): AgentOSv3Result {
    return {
      success: true,
      finalState,
      observations,
      iterations,
      reasoningTrace,
      userGoal: this.userGoal,
      agentGoal: this.agentGoal,
      memorySummary: this.memory.getMemorySummary(),
      knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
      beliefSummary: this.beliefLayer.getBeliefSummary(),
      metaCognitionSummary: this.metaCognition.getMetaCognitionSummary(),
      learningSummary: this.learningPipeline.getLearningPipelineSummary(),
      plan: this.currentPlan,
      goal
    };
  }

  private createHumanInterventionResult(
    finalState: WorldState,
    observations: Observation[],
    iterations: number,
    reasoningTrace: string[],
    goal: ParseResult,
    metaDecision: MetaCognitionDecision
  ): AgentOSv3Result {
    return {
      success: false,
      finalState,
      observations,
      iterations,
      reasoningTrace,
      userGoal: this.userGoal,
      agentGoal: this.agentGoal,
      memorySummary: this.memory.getMemorySummary(),
      knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
      beliefSummary: this.beliefLayer.getBeliefSummary(),
      metaCognitionSummary: this.metaCognition.getMetaCognitionSummary(),
      learningSummary: this.learningPipeline.getLearningPipelineSummary(),
      plan: this.currentPlan,
      goal,
      metaDecision
    };
  }

  private createResult(
    success: boolean,
    finalState: WorldState,
    observations: Observation[],
    iterations: number,
    reasoningTrace: string[],
    goal: ParseResult,
    message: string
  ): AgentOSv3Result {
    return {
      success,
      finalState,
      observations,
      iterations,
      reasoningTrace,
      userGoal: this.userGoal,
      agentGoal: this.agentGoal,
      memorySummary: this.memory.getMemorySummary(),
      knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
      beliefSummary: this.beliefLayer.getBeliefSummary(),
      metaCognitionSummary: this.metaCognition.getMetaCognitionSummary(),
      learningSummary: this.learningPipeline.getLearningPipelineSummary(),
      plan: this.currentPlan,
      goal
    };
  }

  private copyExecutors(target: ExecutorRegistry): void {
    // 实际实现应该完全复制注册的执行器
  }

  private registerDefaultExecutors(): void {
    const createExecutor = (name: string, shouldFailSometimes: boolean = false) => {
      return class {
        static callCount = 0;
        async execute() {
          (this.constructor as any).callCount++;
          const count = (this.constructor as any).callCount;
          
          if (shouldFailSometimes && count % 3 === 0) {
            throw new Error(`Service ${name} temporary failure (simulated)`);
          }
          
          return { success: true, [`${name}Id`]: `${name}-${Date.now()}` };
        }
      };
    };

    this.executorRegistry.register("booking.create", createExecutor("booking"));
    this.executorRegistry.register("booking.cancel", createExecutor("booking"));
    this.executorRegistry.register("booking.confirm", createExecutor("booking"));
    this.executorRegistry.register("payment.refund", createExecutor("refund", true)); // 偶尔失败
  }
}
