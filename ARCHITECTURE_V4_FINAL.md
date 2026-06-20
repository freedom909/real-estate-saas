# AI Planning Engine V4 - 目标回归规划器 (Goal Regression Planner)

## 概述

这是一个完整的 AI 驱动业务能力规划和执行系统，实现了：
1. **目标回归规划** (Goal Regression Planning / Backward Chaining)
2. **混合意图解析** (Hybrid Rule + LLM Intent Parser)
3. **完全解耦的执行器注册** (Executor Registry)
4. **状态查询管理** (State Query API)
5. **Saga 模式补偿** (Saga Pattern Compensation)

## 核心架构概念

### 1. 目标回归规划 (Goal Regression Planning)

这是系统的核心！从目标状态 **向后推导** 所需的能力，而非向前匹配。

**示例流程：**

```
用户目标：refund.created = true
    ↓
找到 PROCESS_REFUND 能力（其 effect 是 refund.created = true）
    ↓
PROCESS_REFUND 的 precondition：booking.status = cancelled
    ↓
继续找能产生 booking.status = cancelled 的能力：CANCEL_BOOKING
    ↓
CANCEL_BOOKING 的 precondition：booking.status = confirmed
    ↓
如果当前状态是 confirmed，则计划完成！
最终计划：CANCEL_BOOKING → PROCESS_REFUND
```

### 2. 混合意图解析 (Hybrid Intent Parser)

```
用户输入 "取消预订并退款"
    ↓
Rule Parser：confidence 0.95（超过阈值 0.9）
    ↓
直接返回 GoalStates（免费，快速）
    ↓
如果 Rule Parser confidence < 0.9
    ↓
调用 LLM Parser
```

### 3. 完全解耦 (Complete Decoupling)

| 组件 | 职责 |
|------|------|
| **Registry** | 纯元数据知识库（无代码） |
| **Executor Registry** | 执行器注册和实例化工厂 |
| **State Store** | 世界状态管理和查询 |

## 目录结构

```
src/ai-platform/domain/orchestration/
├── registry/                    # 纯知识库
│   ├── booking.registry.ts
│   ├── listing.registry.ts
│   ├── payment.registry.ts
│   ├── review.registry.ts
│   ├── capability-registry.types.ts
│   └── index.ts
├── planner/                     # 规划层
│   ├── goal.parser.ts           # 混合目标解析器
│   └── goal.regression.planner.ts # 目标回归规划器
├── state/                       # 状态层
│   ├── world-state.ts           # 状态类型
│   └── state.store.ts           # 状态存储与查询
├── factory/                     # 工厂层
│   └── executor.registry.ts     # 执行器注册中心
├── executor/                    # 执行层
│   └── workflow.executor.ts     # 工作流执行器
├── observation/                 # 观察层
│   └── observation.layer.ts
├── replan/                      # 重规划层
│   └── replan.engine.ts
└── runtime/                     # 完整 Agent 循环
    └── workflow.runtime.ts
```

## 核心 API

### 状态查询 (State Query)

```typescript
// 方式 1：点语法
const status = stateStore.get("booking.status");

// 方式 2：结构化查询
const status = stateStore.get({ 
  entity: "booking", 
  field: "status" 
});

// 设置值
stateStore.set("booking.status", "cancelled");
stateStore.patch([
  { entity: "booking", field: "status", value: "cancelled" },
  { entity: "refund", field: "created", value: true }
]);
```

### 执行器注册 (Executor Registration)

```typescript
const executorRegistry = new ExecutorRegistry();

executorRegistry.register("booking.cancel", CancelBookingExecutor);
executorRegistry.register("payment.refund", ProcessRefundExecutor);

const executor = executorRegistry.create("booking.cancel");
await executor.execute();
```

### 完整 Agent 循环

```typescript
const runtime = new WorkflowRuntime();

const result = await runtime.run(
  { 
    naturalLanguage: "取消预订并退款" 
  },
  { 
    booking: { 
      id: "booking-123", 
      status: "confirmed" 
    } 
  }
);
```

## 能力注册表结构 (V4)

```typescript
{
  id: "CANCEL_BOOKING",
  domain: AIDomain.BOOKING,
  description: "取消预订",
  
  // 核心规划元素
  preconditions: [
    { entity: "booking", field: "status", operator: Operator.EQ, value: "confirmed" }
  ],
  effects: [
    { entity: "booking", field: "status", value: "cancelled" }
  ],
  
  // 执行元数据
  inputs: [...],
  outputs: [...],
  executorId: "booking.cancel",
  compensation: [...],
  tags: [...],
  permissions: [...],
  cost: 0,
  timeoutMs: 15000,
  riskLevel: RiskLevel.HIGH
}
```

## 规划示例

### 示例 1：简单取消 + 退款

**当前状态：**
```typescript
{
  booking: { id: "123", status: "confirmed" }
}
```

**用户意图：** "取消预订并退款"

**规划过程：**
1. 目标 `refund.created = true` → 找到 `PROCESS_REFUND`
2. `PROCESS_REFUND` 的前置条件 `booking.status = cancelled`
3. 找能产生 `cancelled` 的能力 → `CANCEL_BOOKING`
4. `CANCEL_BOOKING` 的前置条件 `confirmed` (当前状态已满足)
5. 完成！

**最终计划：**
```
CANCEL_BOOKING → PROCESS_REFUND
```

### 示例 2：从 pending 开始

**当前状态：**
```typescript
{
  booking: { id: "456", status: "pending" }
}
```

**目标：** `refund.created = true`

**规划过程：**
1. 目标 → `PROCESS_REFUND`
2. 前置：`booking.status = cancelled`
3. 找 `CANCEL_BOOKING`
4. `CANCEL_BOOKING` 前置：`booking.status = confirmed`
5. 找 `CONFIRM_BOOKING`
6. 前置：`booking.status = pending` (当前状态已满足)

**最终计划：**
```
CONFIRM_BOOKING → CANCEL_BOOKING → PROCESS_REFUND
```

## 关键特性

✅ **Backward Chaining (目标回归规划)**  
✅ **Hybrid Intent Parsing (Rule + LLM)**  
✅ **State Query API (点语法 + 结构化)**  
✅ **Executor Registry (完全解耦)**  
✅ **Saga Pattern Compensation (补偿机制)**  
✅ **Observe & Replan Loop (观察与重规划)**  
✅ **Capability Selection by Risk/Cost (多维度能力选择)**

## 未来改进方向

1. **LLM Integration** - 完整实现 `tryLLMParse()`
2. **HTN Planning** - 层次任务网络规划
3. **PDDL Support** - 规划域定义语言支持
4. **Graph Persistence** - 计划图持久化
5. **Distributed Execution** - 分布式执行
6. **Cost Optimized Planning** - 考虑成本的最优规划

---

## 总结

这是一个**真正的 AI 规划系统**，而非简单的工作流引擎！

- Registry 是**知识库**
- Planner 是**推理引擎**
- Executor 是**执行引擎**

系统从目标出发，自动推导执行计划！
