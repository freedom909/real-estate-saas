# AgentOS - AI Agent Operating System

## 概述

AgentOS 是一个完整的 **Cognitive Architecture（认知架构）**，将知识与执行彻底分离，具备完整的记忆、推理、规划和执行能力。

## 核心架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USER INPUT                                 │
│                      "The customer wants to leave and get a refund"             │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEMANTIC LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Rule Extractor (fast) → LLM Extractor (smart) → Hybrid Decision      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ↓ Output: Goal States                                                         │
│     [ { entity: "booking", field: "status", value: "cancelled" },            │
│       { entity: "refund", field: "created", value: true } ]                  │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
┌────────────────────────────────────────┼────────────────────────────────────┐
│      MEMORY LAYER                      │                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │  Episodic Memory │  │  Semantic Memory │  │     Working Memory       │  │
│  │  • Events        │  │  • Concepts      │  │  • Current Goal           │  │
│  │  • Success/Fail  │  │  • Facts         │  │  • Current Plan           │  │
│  │  • Context       │  │  • Relationships │  │  • Recent Observations    │  │
│  └──────────────────┘  └──────────────────┘  └───────────────────────────┘  │
└────────────────────────────────────────┼────────────────────────────────────┘
                                         │
                            ┌────────────┴────────────┐
                            │     OODA LOOP           │
                            │  (Observe → Orient →    │
                            │   Decide → Act)         │
                            └────────────┬────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
    ┌──────────┐                  ┌───────────┐                  ┌───────────┐
    │ OBSERVE  │                  │  ORIENT   │                  │  DECIDE   │
    └────┬─────┘                  └─────┬─────┘                  └─────┬─────┘
         │                              │                              │
         ▼                              ▼                              ▼
┌──────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│ World State      │         │ Update Context    │         │ Reasoner          │
│ Observer         │         │ & Goal Check      │         │  • Root Cause     │
│  • DataSources   │         │                   │         │  • Fix Suggestions│
│  • Auto-discovery│         └───────────────────┘         │  • Service Health │
└──────────────────┘                                      └────────┬──────────┘
         │                                                          │
         └──────────────────────────────┬───────────────────────────┘
                                        │
                                        ▼
                                 ┌───────────┐
                                 │   ACT     │
                                 └─────┬─────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌──────────────────┐  ┌───────────────┐  ┌─────────────────┐
          │   PLANNER        │  │   EXECUTOR    │  │  CAPABILITY     │
          │  Goal Regression │  │   Registry    │  │    Registry     │
          │  • Backward      │  │  • Pure Meta- │  │  • Pure Know-  │
          │    Chaining      │  │    data only │  │    ledge only   │
          │  • Unification   │  │  • No Logic   │  │  • No Execut-  │
          │  • STRIPS/GOAP   │  │               │  │    ion Code    │
          └──────────────────┘  └───────────────┘  └─────────────────┘

```

## 核心组件

### 1. Semantic Layer (语义层)
- **Rule Extractor**: 快速、免费处理常见场景
- **LLM Extractor**: 复杂语义理解的占位符（未来集成真实 LLM）
- **Hybrid Decision**: 根据置信度自动选择合适的提取器

### 2. Memory Layer (记忆层)
- **Episodic Memory**: 事件记忆（成功/失败、上下文）
- **Semantic Memory**: 概念和事实记忆
- **Working Memory**: 当前目标、计划、最近观察的工作记忆
- **Service Health Tracking**: 服务健康度和可靠性追踪

### 3. OODA Loop (观察-定向-决策-行动循环)
- **Observe**: 从真实数据源观察世界状态
- **Orient**: 更新上下文、解析目标
- **Decide**: 推理、失败分析、重规划决策
- **Act**: 执行单步并记录到记忆

### 4. World State Observer (世界状态观察者)
- **DataSource Interface**: 可扩展的数据源接口
  - `listEntities()`: 自动发现实体（无硬编码！）
  - `fetchEntity()`: 获取实体数据
  - `fetch()`: 获取字段数据
- **Cache Management**: 高效的缓存和失效机制
- **Real-time Sync**: 与真实数据源保持同步

### 5. Reasoner (推理层)
- **Goal Achievement Check**: 检查目标是否达成
- **Failure Analysis**: 根因分析和修复建议
- **Service Health Monitoring**: 服务不稳定性检测
- **Memory Integration**: 基于历史记忆的推理

### 6. Goal Regression Planner (目标回归规划器)
- **Dependency Injection**: 注入 WorldStateObserver，状态一致！
- **Backward Chaining**: 从目标反向推导
- **Goal Unification**: 精确匹配 + 软匹配
- **Sub-goal Generation**: 自动生成子目标
- **STRIPS/GOAP**: 经典 AI 规划算法

### 7. Executor & Capability Registry (彻底分离！)
- **Capability Registry**: 纯知识库（元数据）
  - Preconditions
  - Effects
  - Metadata (description, domain, etc.)
- **Executor Registry**: 独立的执行器注册
  - 完全分离，无耦合
  - 支持 DI 容器集成
  - 可插拔的执行器实现

## 关键设计亮点

### ✅ 你最喜爱的设计：Capability ≠ Executor
```typescript
// Capability Registry (纯知识，无代码！)
{
  id: "CANCEL_BOOKING",
  preconditions: [...],
  effects: [...],
  executorId: "booking.cancel" // 仅仅是 ID 引用
}

// Executor Registry (纯执行，无知识！)
ExecutorRegistry.register("booking.cancel", CancelBookingExecutor);

// 完美的关注点分离！
```

### ✅ 自动实体发现（无硬编码！）
```typescript
// ❌ 旧设计：写死实体列表
private getEntitiesForSource(sourceName: string): string[] {
  return ["booking", "payment", "refund"]; // 增加 coupon 需要改代码！
}

// ✅ 新设计：自动发现！
export interface DataSource {
  listEntities(): Promise<string[]>; // 数据源自己知道有什么实体
}

// 增加新实体？只需要在数据源添加数据，无需改代码！
```

### ✅ 状态一致性（单一真相源）
```typescript
// ❌ 旧设计：各自 new 自己的 Observer
class Planner {
  constructor() {
    this.observer = new WorldStateObserver(); // 与 Runtime 不同步！
  }
}

// ✅ 新设计：依赖注入！
class GoalRegressionPlannerV2 {
  constructor(worldStateObserver: WorldStateObserver) { // 注入！
    this.observer = worldStateObserver; // 与 Runtime 共享同一个！
  }
}
```

### ✅ 真正的记忆（不只是状态！）
```typescript
// Agent remembers:
//  • "Refund failed 3 times in a row"
//  • "Payment service reliability: 40%"
//  • "Last success: 10 minutes ago"

// 而不是每次都从零开始规划！
```

## AgentOS vs 传统工作流引擎

| 特性 | AgentOS | 传统工作流引擎 |
|------|---------|---------------|
| 知识与执行 | 彻底分离 | 耦合在一起 |
| 规划方式 | 目标驱动 + 自动规划 | 预定义工作流 |
| 记忆 | 完整的记忆系统 | 无记忆 |
| 推理 | 智能推理 + 根因分析 | 规则引擎 |
| 适应性 | Observe → Replan 循环 | 固定路径 |
| 实体发现 | 自动发现 | 硬编码 |
| 状态管理 | 单一真相源 + 可观察 | 多处不一致 |

## 使用示例

```typescript
const agent = new AgentOS();

// 添加语义知识
agent.semanticLayer.registerRule({...});

// 运行代理
const result = await agent.run(
  { naturalLanguage: "The customer wants to cancel and get a refund" },
  { 
    booking: { id: "123", status: "confirmed" },
    payment: { id: "456", status: "completed" }
  }
);

console.log("Memory Summary:", result.memorySummary);
console.log("Reasoning Trace:", result.reasoningTrace);
```

## 未来演进路径

### 短期
- 完整 LLM 集成到 Semantic Layer
- 向量数据库支持 Memory Layer
- 更丰富的 Failure Analysis

### 中期
- 多 Agent 协作
- 分布式执行
- 计划可视化与调试

### 长期
- 完全的 AGI 认知架构
- 持续学习与知识更新
- 跨领域知识迁移

---

## 总结

AgentOS 已经不是一个工作流引擎了——它是一个 **完整的 Agent 操作系统**：

- ✅ **Cognitive Architecture**（认知架构）
- ✅ **Goal-Driven**（目标驱动）
- ✅ **Memory-Enabled**（有记忆）
- ✅ **Reasoning-Capable**（会推理）
- ✅ **Completely Decoupled**（彻底解耦）
- ✅ **Observer-Based**（基于观察）

准备好了吗？让我们迎接真正的 AI Agent 时代！
