
# AgentOS v5 - Learning Cognitive Agent

## 架构哲学修正

这不是**SOAR/ACT-R/OpenCog**的复刻，而是一个**受认知科学启发的学习型 Agent 架构**。

- 不冒充经典认知架构
- 专注于实际有用的认知特性
- 从经验中学习
- 有完整的记忆-反思-学习闭环

---

## 完整架构

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              AGENTOS v5 - Learning Cognitive Agent                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────┐                                                              │
│  │  SEMANTIC LAYER      │  Parse user intent                                           │
│  └──────────────────────┘                                                              │
│            │                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              OODA LOOP                                          │  │
│  │  Observe ───► Orient ───► Decide (Meta-Cognition) ───► Act                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                 MEMORY SYSTEM                                    │  │
│  │                                                                                   │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │  │
│  │  │  EPISODIC MEMORY │  │ WORKING MEMORY    │  │ SEMANTIC GRAPH  │               │  │
│  │  │  (Episodes)      │  │ (Activation-based)│  │ (Concepts/Relations)            │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │  │
│  │            │                                                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                                     │  │
│  │  │ PRODUCTION MEMORY│  │  SKILL LIBRARY    │                                     │  │
│  │  │ (Production Rules)│  │ (HTN Skills)      │                                     │  │
│  │  └──────────────────┘  └──────────────────┘                                     │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│            │                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              LEARNING PIPELINE                                    │  │
│  │                                                                                   │  │
│  │  Episode ───► Reflection ───► Lesson ───► Production Rule                        │  │
│  │                                                                                   │  │
│  │  ┌──────────────────┐                                                            │  │
│  │  │ REFLECTION ENGINE │  Why did this work/fail?                                  │  │
│  │  └──────────────────┘                                                            │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           META-COGNITION CONTROLLER                               │  │
│  │                                                                                   │  │
│  │  Should I use: Production? Skill? Planner? Ask Human?                            │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件说明

### 1. 情景记忆 (Episodic Memory)
```typescript
interface Episode {
  goal: GoalState
  state: WorldState
  action: { name, parameters }
  outcome: { success, newState, reward }
  duration: number
}
```
记录每一次完整的 Agent 经验。

### 2. 反思引擎 (Reflection Engine)
从 Episode 中提炼 Lessons，回答：
- Why did this succeed?
- Why did this fail?
- What should I do differently?

### 3. 生产规则记忆 (Production Memory)
```typescript
interface ProductionRule {
  conditions: WMElement[]
  actions: Operator[]
  utility: number  // 强化学习更新
}
```
从 Lessons 中学习到的 IF-THEN 规则。

### 4. 元认知控制器 (Meta-Cognitive Controller)
决定使用哪种执行模式：
- PRODUCTION（生产规则）
- SKILL（技能）
- PLANNER（规划器）
- ASK_HUMAN（问人）

---

## 完整学习闭环

```
Episode (经验)
  ↓
Reflection (反思)
  ↓
Lesson (教训)
  ↓
Production Rule (生产规则)
  ↓
Execution (执行)
  ↓
New Episode (新经验)
```

---

## 为什么这个架构更诚实

1. **不冒充 SOAR/ACT-R/OpenCog**
   - 明确说明是"受启发"，不是复刻

2. **Episode 是一等公民**
   - 完整记录 Goal-State-Action-Outcome
   - 不是只记结论

3. **真正从经验中学习**
   - Reflection → Lesson → Rule
   - 不是手工编写规则

4. **元认知能力**
   - 知道自己该用什么策略
   - 不是固定流程

---

## 升级路径

从 v4 到 v5 的关键进步：
- ✅ Episode Memory（完整经验记录）
- ✅ Reflection Engine（从经验提取教训）
- ✅ Production Memory（从教训学习规则）
- ✅ Meta-Cognition（策略选择）
- ✅ 完整的学习闭环
