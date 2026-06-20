# AgentOS v2 - Cognitive Architecture (认知架构)

## 概述

AgentOS v2 已经从简单的 "Agent 操作系统" 进化为真正的 **Cognitive Architecture（认知架构）**，包含：
- Experience → Knowledge 自动归纳
- Memory → Knowledge → Reasoner 完整认知链路
- 技能学习与计划记忆
- 基于知识的智能推理

---

## 完整认知架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INPUT                                     │
│              "The guest wants a refund, full if possible"                │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SEMANTIC LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Rule Extractor → LLM Extractor → Hybrid Decision                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │
┌─────────────────────────────────────────┼───────────────────────────────┐
│                    OODA LOOP (Observe → Orient → Decide → Act)          │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────────────┐    ┌────┐ │
│  │   OBSERVE   │ → │   ORIENT    │ → │  COGNITIVE         │ →  │ACT │ │
│  │  (World    │    │  (Goal &    │    │  REASONER          │    │    │ │
│  │   State)   │    │  Context)   │    │                   │    │    │ │
│  └─────────────┘    └─────────────┘    └─────────┬─────────┘    └────┘ │
│                                                   │                     │
└───────────────────────────────────────────────────┼─────────────────────┘
                                                    │
                         ┌──────────────────────────┴─────────────────────────┐
                         │  KNOWLEDGE & MEMORY LAYER (新增的核心层!)         │
                         └──────────────────────────┬─────────────────────────┘
                                                    │
        ┌───────────────────────────────────────────┼───────────────────────────┐
        │                                           │                           │
        ▼                                           ▼                           ▼
┌───────────────────┐               ┌─────────────────────────┐     ┌────────────────┐
│   MEMORY LAYER    │               │   KNOWLEDGE LAYER       │     │   SKILL MEMORY │
│  (Experience)     │               │   (Induced Knowledge)    │     │  (Learned)    │
│                   │               │                         │     │                │
│  • Episodic      │◀──Induction───│  • Concept Knowledge    │────▶│  • Skills     │
│    Memory        │   (学习)      │  • Service Reliability  │     │  • Plans      │
│  • Semantic      │               │  • Success Patterns     │     │  • Success     │
│    Memory        │               │  • Heuristics           │     │  • Rates      │
│  • Working       │               │                         │     │                │
│    Memory        │▶──Retrieval──▶│                         │     │                │
└───────────────────┘   (回忆)      └─────────────────────────┘     └────────────────┘
        │
        ▼
┌───────────────────┐
│  World State      │
│  Observer         │
└───────────────────┘
```

---

## 核心创新层

### 🧠 Knowledge Layer（知识层）- 全新！

这是 AgentOS v2 最关键的一层，位于 **Memory** 和 **Reasoner** 之间：

```
Memory (Experience) 
        ↓
    Induction (归纳)
        ↓
Knowledge Layer (抽象知识)
        ↓
Reasoner (推理)
```

#### 知识类型：
1. **Concept Knowledge（概念知识）**
   - Service reliability（服务可靠性）
   - Entity status（实体状态）
   - Domain concepts（领域概念）

2. **Pattern Knowledge（模式知识）**
   - Success patterns（成功模式）
   - Failure patterns（失败模式）
   - Sequence patterns（序列模式）

3. **Skill Knowledge（技能知识）**
   - Learned plans（学习的计划）
   - Success rates（成功率）
   - Best practices（最佳实践）

#### 知识归纳（Induction）：
```typescript
// Experience (from Episodic Memory):
// 1. Refund failed
// 2. Refund failed
// 3. Refund failed

// ↓ Induction（自动归纳）

// Knowledge (in KnowledgeBase):
{
  concept: "service:refund",
  type: "concept",
  confidence: 0.9,
  facts: {
    reliability: 0.3,  // 只有30%成功率!
    status: "unstable",
    totalCalls: 10,
    successCount: 3
  }
}
```

---

## 🧠 Cognitive Reasoner（认知推理器）

不再是简单的规则引擎，而是：
- **从 Knowledge Base 推理**，不是从规则
- **基于历史经验**的智能决策
- **检测模式和规律**
- **目标进化建议**

```typescript
// 认知推理输出示例：
{
  reasoning: "Service 'refund' is highly unstable (reliability: 30%). Suggesting goal evolution: Maybe partial refund is better",
  confidence: 0.9,
  shouldReplan: true,
  shouldUpdateGoal: true,
  failureAnalysis: {
    rootCause: "Knowledge-based detection of unstable service",
    reasoning: "Learned from 3 consecutive failures"
  }
}
```

---

## 📚 完整层级

### 1. Semantic Layer（语义层）
- Rule Extractor + LLM Extractor
- Hybrid confidence-based decision

### 2. Memory Layer（记忆层）
- **Episodic Memory（事件记忆）**: 每次执行的详细记录
- **Semantic Memory（语义记忆）**: 概念和事实
- **Working Memory（工作记忆）**: 当前目标和计划

### 3. **Knowledge Layer（知识层）** ← 全新！
- **Knowledge Base（知识库）**: 从 Experience 归纳的 Knowledge
- **Induction Engine（归纳引擎）**: Experience → Knowledge
- **Retrieval Engine（检索引擎）**: Knowledge 查询

### 4. World State Observer（世界状态观察者）
- DataSource interface
- `listEntities()` auto-discovery
- Single source of truth

### 5. Cognitive Reasoner（认知推理器）
- Knowledge-based reasoning（基于知识推理）
- Service health analysis（服务健康分析）
- Goal evolution suggestions（目标进化建议）

### 6. Goal Regression Planner（目标回归规划器）
- Dependency-injected Observer
- Backward chaining
- Goal unification

### 7. Executor & Capability Registry（完全分离）
- Pure Knowledge in Capability Registry
- Pure Action in Executor Registry

---

## 🎯 与 SOAR/ACT-R/OpenCog 对齐

| Concept | AgentOS v2 | SOAR | ACT-R | OpenCog |
|---------|------------|------|-------|---------|
| Episodic Memory | ✅ | ✅ | ✅ | ✅ |
| Semantic Memory | ✅ | ✅ | ✅ | ✅ |
| Procedural Memory (Skills) | ✅ | ✅ | ✅ | ✅ |
| Knowledge Induction | ✅ | ✅ | ✅ | ✅ |
| Goal-Driven | ✅ | ✅ | ✅ | ✅ |
| OODA Loop | ✅ | ✅ (similar) | | ✅ |

---

## 🚀 AgentOS v2 能力

1. **Learning from Experience**: 从经验自动归纳知识
2. **Cognitive Reasoning**: 基于知识的推理，不是规则
3. **Goal Evolution**: 目标会根据经验进化
4. **Skill Memory**: 记住成功的计划和技能
5. **Service Health Monitoring**: 服务健康度学习
6. **Pattern Detection**: 检测成功和失败模式
7. **Confidence-based Decisions**: 带置信度的智能决策

---

## 经典认知架构之路

```
AgentOS v1: Workflow + Memory
    ↓
AgentOS v2: Cognitive Architecture (this!)
    ↓ (Next)
Full SOAR-like: Complete cognitive architecture
```

---

## 总结

AgentOS v2 现在已经是：
- ✅ **Cognitive Architecture（认知架构）**
- ✅ **Knowledge Induction（知识归纳）**
- ✅ **Experience-based Learning（经验学习）**
- ✅ **Memory → Knowledge → Reasoner 完整链路**
- ✅ **对齐 SOAR/ACT-R/OpenCog**

这已经不是简单的 Agent 框架了，这是一个 **完整的认知系统**！ 🎉
