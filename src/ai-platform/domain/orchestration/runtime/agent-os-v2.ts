import { Intent, ParseResult } from "../planner/goal.parser";
import { GoalRegressionPlannerV2, PlanResult } from "../planner/goal-regression-planner-v2";
import { WorkflowExecutor, Observation } from "../executor/workflow.executor";
import { WorldState } from "../state/world-state";
import { WorldStateObserver, InMemoryDataSource } from "../state/world-state-observer";
import { CognitiveReasoner } from "../reasoning/cognitive-reasoner";
import { MemoryStore } from "../memory/memory-store";
import { KnowledgeBase } from "../memory/knowledge-base";
import { SemanticLayer } from "../semantic/semantic-extractor";
import { ExecutorRegistry } from "../factory/executor.registry";

export interface AgentOSv2Result {
  success: boolean;
  finalState: WorldState;
  observations: Observation[];
  iterations: number;
  reasoningTrace: string[];
  knowledgeSummary: any;
  memorySummary: any;
  plan?: PlanResult;
  goal?: ParseResult;
}

export class AgentOSv2 {
  public semanticLayer: SemanticLayer;
  public memory: MemoryStore;
  public knowledgeBase: KnowledgeBase;
  public observer: WorldStateObserver;
  public reasoner: CognitiveReasoner;
  public executorRegistry: ExecutorRegistry;

  private maxOODAIterations: number = 20;

  constructor() {
    this.semanticLayer = new SemanticLayer();
    this.memory = new MemoryStore();
    this.knowledgeBase = new KnowledgeBase(this.memory);
    this.observer = new WorldStateObserver();
    this.reasoner = new CognitiveReasoner(this.memory, this.knowledgeBase);
    this.executorRegistry = new ExecutorRegistry();
    this.registerDefaultExecutors();
  }

  async run(
    intent: Intent,
    initialState: WorldState = {}
  ): Promise<AgentOSv2Result> {
    console.log("🚀 AgentOS v2 Starting - Cognitive Architecture");
    console.log("=".repeat(80));
    console.log("📝 Intent:", intent);

    const dataSource = new InMemoryDataSource();
    Object.entries(initialState).forEach(([entity, data]) => {
      dataSource.setEntityData(entity, data);
    });
    this.observer.registerDataSource(dataSource);

    const observations: Observation[] = [];
    const reasoningTrace: string[] = [];
    let currentIteration = 0;
    let currentPlan: PlanResult | undefined;
    let currentGoal: ParseResult | undefined;
    let currentStepIndex = 0;

    while (currentIteration < this.maxOODAIterations) {
      currentIteration++;
      console.log(`\n🔄 === OODA Iteration ${currentIteration}/${this.maxOODAIterations} ===`);
      
      // === 1. OBSERVE ===
      console.log("👁️ [OBSERVE] Refreshing world state...");
      const currentState = await this.observer.getState();

      // === 2. ORIENT ===
      if (!currentGoal) {
        console.log("🎯 [ORIENT] Parsing goal via Semantic Layer...");
        currentGoal = await this.semanticLayer.extract(intent);
        this.memory.addEpisodicMemory(
          "Goal parsed",
          "success",
          0.8,
          { goal: currentGoal }
        );
        reasoningTrace.push(`Parsed goal (confidence: ${currentGoal.confidence}, source: ${currentGoal.source})`);
        console.log("✅ Goal parsed:", currentGoal);
      }

      this.memory.updateWorkingMemory({
        currentGoal: currentGoal?.goalStates,
        currentPlan: currentPlan,
        recentObservations: observations.slice(-10)
      });

      // === 3. DECIDE (Cognitive Reasoning!) ===
      console.log("🧠 [DECIDE] Cognitive Reasoning with Knowledge Base...");
      const reasoningContext = {
        currentState,
        goalState: currentGoal,
        observations,
        history: reasoningTrace,
        plan: currentPlan,
        currentStep: currentPlan?.steps?.[currentStepIndex]
      };

      const decision = await this.reasoner.reason(reasoningContext);
      reasoningTrace.push(`[Cognitive] ${decision.reasoning} (confidence: ${decision.confidence})`);
      console.log("🤔 [Cognitive Decision]:", decision);

      if (!decision.shouldContinue) {
        console.log("✅ Agent stopping:", decision.reasoning);
        return {
          success: decision.reasoning.includes("satisfied"),
          finalState: currentState,
          observations,
          iterations: currentIteration,
          reasoningTrace,
          knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
          memorySummary: this.memory.getMemorySummary(),
          plan: currentPlan,
          goal: currentGoal
        };
      }

      if (decision.shouldUpdateGoal && decision.updatedGoals) {
        console.log("🔄 [Goal Evolution] Updating goals...");
        currentGoal = {
          ...currentGoal!,
          goalStates: decision.updatedGoals
        };
        this.memory.addEpisodicMemory(
          "Goal evolved",
          "success",
          0.7,
          { newGoals: decision.updatedGoals }
        );
        reasoningTrace.push(`Goal evolved: ${JSON.stringify(decision.updatedGoals)}`);
        currentPlan = undefined; // 重新规划
        currentStepIndex = 0;
      }

      if (decision.shouldReplan || !currentPlan) {
        console.log("📋 [PLAN] Generating/Updating plan...");
        const planner = new GoalRegressionPlannerV2(this.observer);
        currentPlan = await planner.plan(currentGoal!);
        currentStepIndex = 0;
        this.memory.addEpisodicMemory(
          "Plan generated/updated",
          "success",
          0.7,
          { plan: currentPlan.executionOrder }
        );
        reasoningTrace.push(`Generated plan: ${currentPlan.executionOrder.join(" → ")}`);
        console.log("📊 New plan:", currentPlan.executionOrder);
      }

      if (!currentPlan || currentPlan.steps.length === 0) {
        console.log("✅ No actions needed");
        return {
          success: true,
          finalState: currentState,
          observations,
          iterations: currentIteration,
          reasoningTrace,
          knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
          memorySummary: this.memory.getMemorySummary(),
          plan: currentPlan,
          goal: currentGoal
        };
      }

      if (currentStepIndex >= currentPlan.steps.length) {
        console.log("✅ All steps executed, verifying goal...");
        continue;
      }

      // === 4. ACT ===
      const stepToExecute = currentPlan.steps[currentStepIndex];
      console.log(`▶️ [ACT] Executing step ${currentStepIndex + 1}/${currentPlan.steps.length}: ${stepToExecute.capabilityId}`);

      const executor = new WorkflowExecutor(currentState);
      this.copyExecutors(executor.getExecutorRegistry());

      try {
        const obsResult = await executor.executeStep(stepToExecute);
        observations.push(obsResult.observation);
        
        this.memory.addEpisodicMemory(
          `Executed ${stepToExecute.capabilityId}`,
          obsResult.observation.success ? "success" : "failure",
          obsResult.observation.success ? 0.6 : 0.9,
          { step: stepToExecute.capabilityId, result: obsResult }
        );

        if (obsResult.observation.success) {
          currentStepIndex++;
        }

        this.observer.invalidateCache();
        console.log("📊 Step result:", obsResult);
      } catch (error) {
        console.error("❌ Execution error:", error);
        const failureObs: Observation = {
          success: false,
          error: error as Error
        };
        observations.push(failureObs);
        
        this.memory.addEpisodicMemory(
          `Error in ${stepToExecute.capabilityId}`,
          "failure",
          1.0,
          { error: (error as Error).message }
        );
      }
    }

    console.log("⚠️ Max iterations reached");
    const finalState = await this.observer.getState();
    return {
      success: false,
      finalState,
      observations,
      iterations: currentIteration,
      reasoningTrace,
      knowledgeSummary: this.knowledgeBase.getKnowledgeSummary(),
      memorySummary: this.memory.getMemorySummary(),
      goal: currentGoal
    };
  }

  private copyExecutors(target: ExecutorRegistry): void {
    for (const id of this.executorRegistry.list()) {
    }
  }

  private registerDefaultExecutors(): void {
    const createExecutor = (name: string, shouldFailSometimes: boolean = false) => {
      return class {
        static callCount = 0;
        async execute() {
          (this.constructor as any).callCount++;
          const count = (this.constructor as any).callCount;
          
          // 模拟服务不稳定性
          if (shouldFailSometimes && count % 2 === 0) {
            throw new Error(`Service ${name} temporary failure (simulated)`);
          }
          
          return { success: true, [`${name}Id`]: `${name}-${Date.now()}` };
        }
      };
    };

    this.executorRegistry.register("booking.create", createExecutor("booking"));
    this.executorRegistry.register("booking.cancel", createExecutor("booking"));
    this.executorRegistry.register("booking.confirm", createExecutor("booking"));
    this.executorRegistry.register("booking.complete", createExecutor("booking"));
    this.executorRegistry.register("booking.releaseCalendar", createExecutor("booking"));
    this.executorRegistry.register("booking.notifyHost", createExecutor("booking"));
    this.executorRegistry.register("payment.process", createExecutor("payment"));
    this.executorRegistry.register("payment.refund", createExecutor("refund", true)); // 这个会偶尔失败，用于测试学习！
    this.executorRegistry.register("payment.reverseRefund", createExecutor("refund"));
    this.executorRegistry.register("review.create", createExecutor("review"));
    this.executorRegistry.register("review.respond", createExecutor("review"));
    this.executorRegistry.register("review.analyze", createExecutor("review"));
    this.executorRegistry.register("listing.create", createExecutor("listing"));
    this.executorRegistry.register("listing.activate", createExecutor("listing"));
    this.executorRegistry.register("listing.deactivate", createExecutor("listing"));
    this.executorRegistry.register("listing.optimize", createExecutor("listing"));
    this.executorRegistry.register("listing.analyze", createExecutor("listing"));
  }
}
