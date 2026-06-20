
# AgentOS v6 - Experience-Driven Agent

## 核心理念

**停止堆认知名词，开始做有用的学习！**

AgentOS v6 专注于：
- Episode Retrieval（案例检索）
- Rule Extraction（规则提取）
- Policy Learning（策略学习）
- Business Workflow Learning（业务流程学习）

---

## 完整架构

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            AGENTOS v6 - Experience-Driven Agent                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  User Request ───► Semantic Parse ───► Goal                                            │
│                                                                                          │
│                                      │                                                 │
│                                      ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        STRATEGY SELECTOR (Policy Learning)                       │  │
│  │                                                                                   │  │
│  │  Based on: Episode Reuse Success? Rule Success? Planner Success?                │  │
│  │                                                                                   │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                                 │
│  ┌───────────────────────────────────┼───────────────────────────────────────────────┐  │
│  │                                   │                                               │  │
│  ▼                                   ▼                                               ▼  │
│  ┌──────────────────┐     ┌──────────────────┐      ┌──────────────────┐           │  │
│  │  EPISODE REUSE   │     │ PRODUCTION RULE  │      │     PLANNER      │           │  │
│  │  (CBR)           │     │                  │      │                  │           │  │
│  │  Retrieve similar│     │  Use learned rule│      │  Fallback        │           │  │
│  │  past episodes   │     │                  │      │                  │           │  │
│  └──────────────────┘     └──────────────────┘      └──────────────────┘           │  │
│  │                                   │                                               │  │
│  └───────────────────────────────────┼───────────────────────────────────────────────┘  │
│                                      ▼                                                 │
│                              EXECUTE ACTION                                            │
│                                      │                                                 │
│                                      ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                             OUTCOME & LEARNING                                   │  │
│  │                                                                                   │  │
│  │  1. Record Episode (Goal-State-Action-Outcome)                                   │  │
│  │  2. Extract Production Rule from Episode                                          │  │
│  │  3. Update Policy Stats (success rates)                                           │  │
│  │  4. Update WorldState                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件

### 1. 策略选择器 (Policy Learning)
基于真实数据决策：
- Episode Reuse 成功率？
- Production Rule 成功率？
- Planner 成功率？

```typescript
interface PolicyStats {
  episode_reuse: { attempts, successes, avgTime }
  production_rule: { attempts, successes, avgTime }
  planner: { attempts, successes, avgTime }
}
```

### 2. 案例复用 (Episode Retrieval & Reuse)
- 找到相似的历史 Episode
- 复用当时的 Action
- Case-Based Reasoning (CBR)

### 3. 真实规则提取 (Rule Extraction)
从 Episode 中提取：
```
IF booking.status = confirmed AND payment.status = paid
THEN booking.cancel
```

不是假规则！

### 4. 真实 WorldState 更新
- 执行成功 → 更新世界状态
- 不再有虚假经验

---

## 完整学习闭环

```
1. Episode (记录经验)
   ↓
2. Episode Retrieval (找到相似经验)
   ↓
3. Strategy Selection (基于成功率选择策略)
   ↓
4. Execute (执行)
   ↓
5. Outcome (结果)
   ↓
6. Update WorldState (真实更新世界状态)
   ↓
7. Record Episode (记录新经验)
   ↓
8. Extract Rule (提取规则)
   ↓
9. Update Policy Stats (更新策略统计)
```

---

## AgentOS v6 的诚实承诺

1. **不冒充 SOAR/ACT-R/OpenCog**
   - 我们是 Experience-Driven Agent
   
2. **不堆无用的认知层**
   - 专注于：案例检索、规则提取、策略学习
   
3. **不再有虚假经验**
   - WorldState 真实更新
   
4. **学习真实业务流程**
   - 取消订单、退款、释放房源...

---

## 升级路径

| 版本 | 核心 |
|------|------|
| v1-v3 | 工作流 + 规划 |
| v4-v5 | 受认知启发（有很多假的东西） |
| v6 | ✅ Experience-Driven (真实学习) |

---

## 关键文件

- `agent-os-v6.ts` - 主系统
- `test-agent-os-v6.ts` - 演示（20个真实业务 Episode）
