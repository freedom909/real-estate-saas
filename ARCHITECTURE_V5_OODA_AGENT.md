# AI Agent Architecture V5 - OODA Loop 架构

## 概述

这是一个完全成熟的 AI Agent 架构，包含：
1. **OODA Loop (Observe → Orient → Decide → Act)**
2. **Goal Regression Planning (目标回归规划)**
3. **Semantic Layer (语义层)**
4. **Unification Engine (统一引擎)**
5. **Observer-Based World State (可观察世界状态)**
6. **完全解耦的 Executor/Capability Registry**

---

## 完整架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                              │
│                  "取消预订并退款"                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SEMANTIC LAYER (语义层)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Rule Extractor  │  LLM Extractor                      │   │
│  │  (快速免费)      │  (复杂理解)                         │   │
│  └───────────────────┴─────────────────────────────────────┘   │
│  │                 Hybrid Confidence Check                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Goal States   │
                    └────────┬────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                       OODA LOOP                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. OBSERVE (观察)                                       │   │
│  │     WorldStateObserver ←→ DataSources                    │   │
│  │     真实数据库观察 ←→ 状态快照                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │  2. ORIENT (定向)                                        │ │
│  │     Parse Goal                                           │ │
│  │     Update Context                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │  3. DECIDE (决策) → REASONING LAYER                      │ │
│  │     ┌─────────────────────────────────────────────────┐ │ │
│  │     │  Reasoner                                       │ │ │
│  │     │  - All goals satisfied?                         │ │ │
│  │     │  - Need to replan?                              │ │ │
│  │     │  - What to do next?                             │ │ │
│  │     └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │  4. PLAN (规划) → GOAL REGRESSION PLANNER V2            │ │
│  │     ┌─────────────────────────────────────────────────┐ │ │
│  │     │  Goal Unification Engine                        │ │ │
│  │     │  - Exact match (1.0)                            │ │ │
│  │     │  - Soft match (0.8-0.95)                        │ │ │
│  │     │  - Type-aware unification                       │ │ │
│  │     └─────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │     Goal: refund.created=true                            │ │
│  │       ↓                                                  │ │
│  │     Find: PROCESS_REFUND                                 │ │
│  │       ↓ (需要)                                           │ │
│  │     Precondition: booking.status=cancelled               │ │
│  │       ↓                                                  │ │
│  │     Find: CANCEL_BOOKING                                 │ │
│  │       ↓ (需要)                                           │ │
│  │     Precondition: booking.status=confirmed               │ │
│  │       ↓ (当前状态满足)                                   │ │
│  │     Plan: CANCEL → REFUND                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │  5. ACT (执行) → EXECUTION LAYER                        │ │
│  │     ┌─────────────────────────────────────────────────┐ │ │
│  │     │  ExecutorRegistry                               │ │ │
│  │     │  - booking.cancel                                │ │ │
│  │     │  - payment.refund                                │ │ │
│  │     └─────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │     ┌─────────────────────────────────────────────────┐ │ │
│  │     │  CapabilityRegistry (纯知识!)                    │ │ │
│  │     │  - CANCEL_BOOKING (元数据)                       │ │ │
│  │     │  - PROCESS_REFUND (元数据)                       │ │ │
│  │     └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OBSERVATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Observe Results → Update World State → Invalidate Cache │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   LOOP AGAIN?   │
                    └────────┬────────┘
                             │
                             ▼ (是)
                     ┌───────────────┐
                     │  Next OODA    │
                     └───────────────┘
```

---

## 核心层级

### 1. 语义层 (Semantic Layer)
```typescript
SemanticLayer {
  RuleBasedExtractor (免费，快速，高置信度)
  LLMExtractor (复杂理解，可扩展)
  Hybrid Threshold Check
}
```

### 2. 观察层 (Observation Layer)
```typescript
WorldStateObserver {
  DataSources: [InMemory, Database, API, ...]
  Cache Management
  Real-time State Refresh
}
```

### 3. 推理层 (Reasoning Layer)
```typescript
Reasoner {
  Goal Achievement Check
  Failure Analysis
  Replan Decision
  Confidence Calculation
}
```

### 4. 规划层 (Planning Layer)
```typescript
GoalRegressionPlannerV2 {
  GoalUnificationEngine (非精确匹配!)
  Dependency Graph Building
  Topological Sort
}
```

### 5. 执行层 (Execution Layer)
```typescript
ExecutorRegistry {
  完全与 CapabilityRegistry 分离!
  支持 Dependency Injection
  支持多种实现方式
}
```

---

## 目录结构 (最终版)

```
orchestration/
├── registry/                      # 纯知识库 (Knowledge Layer)
│   ├── booking.registry.ts
│   ├── listing.registry.ts
│   ├── payment.registry.ts
│   ├── review.registry.ts
│   ├── capability-registry.types.ts
│   └── index.ts
│
├── semantic/                      # 语义层 (Semantic Layer)
│   └── semantic-extractor.ts      # Rule+LLM 混合提取器
│
├── reasoning/                     # 推理层 (Reasoning Layer)
│   ├── reasoner.ts                # 决策推理器
│   └── goal-unification.ts        # 目标统一引擎
│
├── planner/                       # 规划层 (Planning Layer)
│   ├── goal.parser.ts
│   ├── goal.regression.planner.ts
│   └── goal-regression-planner-v2.ts
│
├── state/                         # 状态层 (State Layer)
│   ├── world-state.ts
│   ├── state.store.ts
│   └── world-state-observer.ts
│
├── factory/                       # 工厂层 (Factory Layer)
│   └── executor.registry.ts
│
├── executor/                      # 执行层 (Execution Layer)
│   └── workflow.executor.ts
│
├── observation/                   # 观察层 (Observation Layer)
│   └── observation.layer.ts
│
├── replan/                        # 重规划层 (Replan Layer)
│   └── replan.engine.ts
│
└── runtime/                       # 运行时 (Runtime Layer)
    ├── workflow.runtime.ts
    └── ooda-agent-loop.ts         # OODA Loop 核心!
```

---

## 关键特性

### ✅ 你最喜欢的设计 (完美保留!)
- **CapabilityRegistry ≠ ExecutorRegistry** - 完美分离
- **知识层 vs 执行层** - 完全解耦
- **DDD + GOAP + Agent** 思想统一

### ✅ 解决的问题
1. **OODA Loop (Observe → Orient → Decide → Act)** - 真正的 Agent Loop
2. **Observer-Based World State** - 从真实数据源获取，而非人工 setState
3. **Goal Unification** - 非精确匹配，支持软匹配
4. **Semantic Layer** - Rule+LLM 混合，与现有 AI Platform 天然融合
5. **Reasoning Layer** - Think 层!

---

## 使用示例

### 简单取消+退款
```typescript
const agent = new OODAAgentLoop();
const result = await agent.run(
  { naturalLanguage: "取消预订并退款" },
  { booking: { id: "123", status: "confirmed" } }
);
```

### 从 Pending 开始的完整流程
```
OBSERVE: booking.status=pending
ORIENT: Goal: refund.created=true
DECIDE: Need to plan
PLAN: CONFIRM → CANCEL → REFUND
ACT: Execute CONFIRM
OBSERVE: booking.status=confirmed
... 继续循环
```

---

## 与现有 AI Platform 融合

这个架构已经为与现有 `RuleExtractor` / `LLMExtractor` / `SemanticContext` 的融合准备了完美的集成点！

### 融合路径
1. `SemanticLayer` → 直接替换现有 Intent 解析
2. `WorldStateObserver` → 连接真实数据库
3. `Reasoner` → 集成 LLM 深度推理
4. `OODAAgentLoop` → 完整替换现有执行引擎

---

## 总结

这是一个 **成熟的 AI Agent 架构**，包含了：
- ✅ 完全解耦的知识与执行
- ✅ OODA/ReAct 模式
- ✅ 可观察的世界状态
- ✅ 目标回归规划 + 统一引擎
- ✅ 语义层集成点

准备好迎接真正的 AI Agent 时代了！
