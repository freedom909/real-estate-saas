
import { Intent, ParseResult } from "../planner/goal.parser";
import { WorldState } from "../state/world-state";
import { WorldStateObserver, InMemoryDataSource } from "../state/world-state-observer";
import { MemoryStore } from "../memory/memory-store";
import { HTNSkillLibrary } from "../memory/htn-skill-library";
import { CognitiveGraph } from "../memory/cognitive-graph";
import { TruthMaintenanceSystem, JustificationType } from "../memory/truth-maintenance-system";
import { ACTRWorkingMemory } from "../memory/actr-working-memory";
import { BeliefLayer, BeliefType } from "../memory/belief-layer";
import { SemanticLayer } from "../semantic/semantic-extractor";
import { CognitiveReasoningEngine } from "../reasoning/cognitive-reasoning-engine";
import { SOARChunkingEngine } from "../learning/soar-chunking-engine";
import { ExecutorRegistry } from "../factory/executor.registry";

export interface AgentOSv4Result {
  success: boolean;
  iterations: number;
  memorySummary: any;
  tmsSummary: any;
  cognitiveGraphSummary: any;
  workingMemorySummary: any;
  reasoningSummary: any;
  chunkingSummary: any;
  skillSummary: any;
}

export class AgentOSv4 {
  // 语义层
  public semanticLayer: SemanticLayer;

  // 记忆系统
  public memoryStore: MemoryStore;
  public tms: TruthMaintenanceSystem;
  public cognitiveGraph: CognitiveGraph;
  public workingMemory: ACTRWorkingMemory;
  public beliefLayer: BeliefLayer;

  // 认知系统
  public reasoningEngine: CognitiveReasoningEngine;

  // 学习系统
  public chunkingEngine: SOARChunkingEngine;
  public skillLibrary: HTNSkillLibrary;

  // 观察与执行
  public worldObserver: WorldStateObserver;
  public executorRegistry: ExecutorRegistry;

  private maxIterations: number = 50;

  constructor() {
    // 初始化所有层
    this.semanticLayer = new SemanticLayer();
    
    this.memoryStore = new MemoryStore();
    this.beliefLayer = new BeliefLayer();
    this.tms = new TruthMaintenanceSystem();
    this.cognitiveGraph = new CognitiveGraph();
    this.workingMemory = new ACTRWorkingMemory();

    this.reasoningEngine = new CognitiveReasoningEngine(this.cognitiveGraph, this.tms, this.workingMemory);

    this.skillLibrary = new HTNSkillLibrary();
    this.chunkingEngine = new SOARChunkingEngine(this.skillLibrary);

    this.worldObserver = new WorldStateObserver();
    this.executorRegistry = new ExecutorRegistry();

    this.initCognitiveGraph();
    this.registerDefaultExecutors();
  }

  private initCognitiveGraph(): void {
    console.log("🧠 [AgentOS v4] Initializing cognitive graph with basic concepts");

    // 创建基本概念
    const human = this.cognitiveGraph.addConcept("Human", 1.0, 0.95);
    const customer = this.cognitiveGraph.addConcept("Customer", 1.0, 0.9);
    const service = this.cognitiveGraph.addConcept("Service", 1.0, 0.9);
    const refund = this.cognitiveGraph.addConcept("Refund", 1.0, 0.85);
    const trust = this.cognitiveGraph.addConcept("Trust", 1.0, 0.85);
    const booking = this.cognitiveGraph.addConcept("Booking", 1.0, 0.9);
    const payment = this.cognitiveGraph.addConcept("Payment", 1.0, 0.9);

    // 建立继承关系
    this.cognitiveGraph.addInheritance(customer, human, 0.99);

    // 创建谓词
    const needs = this.cognitiveGraph.addPredicate("Needs", 2);
    const increases = this.cognitiveGraph.addPredicate("Increases", 2);

    // 添加蕴涵关系：Refund 增加 Trust
    this.cognitiveGraph.addImplication(refund, trust, 0.9, 0.85);

    console.log("✅ [AgentOS v4] Cognitive graph initialized");
  }

  async run(intent: Intent, initialState: WorldState): Promise<AgentOSv4Result> {
    console.log(`🚀 [AgentOS v4] Starting - Full Cognitive Architecture`);
    console.log(`🎯 Intent: ${JSON.stringify(intent)}`);
    console.log(`🌍 Initial State: ${JSON.stringify(initialState, null, 2)}`);

    // 初始化数据源
    const dataSource = new InMemoryDataSource();
    Object.entries(initialState).forEach(([entity, data]) => {
      dataSource.setEntityData(entity, data);
    });
    this.worldObserver.registerDataSource(dataSource);

    // 初始化工作记忆
    this.workingMemory.updateFromWorldState(initialState);

    let iterations = 0;

    // OODA 循环
    while (iterations < this.maxIterations) {
      iterations++;
      console.log(`\n🔄 === OODA Iteration ${iterations} ===`);

      // 1. OBSERVE (观察)
      console.log("👁️ [OODA] Observing world state");
      const currentState = await this.worldObserver.getState();
      this.workingMemory.updateFromWorldState(currentState);

      // 2. ORIENT (定向)
      console.log("🧭 [OODA] Orienting - parsing goal");
      const parseResult = await this.semanticLayer.extract(intent);

      // 在 TMS 中记录目标作为信念
      for (const goal of parseResult.goalStates) {
        const belief = this.beliefLayer.addBelief(
          `Goal: ${goal.entity}.${goal.field} = ${goal.value}`,
          0.95,
          "user_intent",
          BeliefType.FACT
        );
        
        this.tms.addBelief(belief);
      }

      // 3. DECIDE (决策) - 认知推理
      console.log("🧠 [OODA] Deciding - cognitive reasoning");
      const reasoningSteps = await this.reasoningEngine.reason({}, currentState);
      
      // 记录推理轨迹用于学习
      if (reasoningSteps.length > 0) {
        this.chunkingEngine.recordReasoningTrace({
          steps: reasoningSteps,
          startState: initialState,
          endState: currentState,
          goalAchieved: true, // 简化
          timestamp: Date.now()
        });
      }

      // 4. ACT (行动) - 这里简化为执行推理结论
      console.log("⚡ [OODA] Acting - executing conclusions");

      // 检查是否可以结束
      const canComplete = this.checkGoalAchievement(parseResult, currentState);
      if (canComplete) {
        console.log("✅ [AgentOS v4] Goal achieved!");
        break;
      }
    }

    // 返回完整结果
    return {
      success: true,
      iterations,
      memorySummary: this.memoryStore.getMemorySummary(),
      tmsSummary: this.tms.getTMSState(),
      cognitiveGraphSummary: this.cognitiveGraph.getGraphSummary(),
      workingMemorySummary: this.workingMemory.getActivationSummary(),
      reasoningSummary: this.reasoningEngine.getReasoningSummary(),
      chunkingSummary: this.chunkingEngine.getChunkingSummary(),
      skillSummary: this.skillLibrary.getSkillLibrarySummary()
    };
  }

  private checkGoalAchievement(parseResult: ParseResult, state: WorldState): boolean {
    if (!parseResult.goalStates || parseResult.goalStates.length === 0) return true;

    for (const goal of parseResult.goalStates) {
      const entityState = state[goal.entity];
      if (!entityState || entityState[goal.field] !== goal.value) {
        return false;
      }
    }
    return true;
  }

  private registerDefaultExecutors(): void {
    const createExecutor = (name: string) => {
      return class {
        async execute() {
          return { success: true, [`${name}Id`]: `${name}-${Date.now()}` };
        }
      };
    };

    this.executorRegistry.register("booking.cancel", createExecutor("booking"));
    this.executorRegistry.register("payment.refund", createExecutor("refund"));
  }

  printSystemStatus(): void {
    console.log("\n" + "=".repeat(80));
    console.log("📊 [AgentOS v4] System Status");
    console.log("=".repeat(80));
    
    console.log("\n🧠 Memory Store:");
    console.log(JSON.stringify(this.memoryStore.getMemorySummary(), null, 2));

    console.log("\n🔒 Truth Maintenance:");
    console.log(JSON.stringify(this.tms.getTMSState(), null, 2));

    console.log("\n🕸️ Cognitive Graph:");
    console.log(JSON.stringify(this.cognitiveGraph.getGraphSummary(), null, 2));

    console.log("\n🧠 Working Memory (ACT-R):");
    console.log(JSON.stringify(this.workingMemory.getActivationSummary(), null, 2));

    console.log("\n🔍 Reasoning:");
    console.log(JSON.stringify(this.reasoningEngine.getReasoningSummary(), null, 2));

    console.log("\n🧩 Chunking (SOAR):");
    console.log(JSON.stringify(this.chunkingEngine.getChunkingSummary(), null, 2));

    console.log("\n🛠️ Skills (HTN):");
    console.log(JSON.stringify(this.skillLibrary.getSkillLibrarySummary(), null, 2));
  }
}
