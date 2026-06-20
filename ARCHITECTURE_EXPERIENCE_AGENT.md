
# ExperienceAgent Architecture

## 核心思想

**停止堆版本号，做真正的学习！**

不再有 AgentOS v1-v6...

现在只有一个稳定的架构：ExperienceAgent

---

## 目录结构

```
src/ai-platform
├── environment/
│   ├── world-model.ts       # 持久化的世界模型
│   └── event-bus.ts         # 事件总线
│
├── memory/
│   └── episodic/
│       └── episode-record.ts  # Episode 数据库（真实业务记录）
│
├── executor/
│   ├── booking-executor.ts    # 真实 Booking Service
│   └── payment-executor.ts    # 真实 Payment Service
│
├── learning/
│   ├── rule-learner.ts        # 规则学习（丢弃 ID，保留业务属性）
│   └── policy-learner.ts      # 策略学习（Q-Learning，上下文相关）
│
└── agent/
    └── experience-agent.ts    # 主 Agent
```

---

## 完整学习循环

```
World State (持久)
      ↓
Goal + Context
      ↓
Policy Learner (Q Table) → Strategy (Rule/Episode/Planner)
      ↓
Execute Action
      ↓
Outcome + Reward
      ↓
Record Episode
      ↓
Rule Learning (from success)
      ↓
Policy Learning (update Q)
      ↓
Next Decision
```

---

## 核心改进

### 1. 真实 WorldState（不再每次 run 重建）
```typescript
// v6 (Bad):
const dataSource = new InMemoryDataSource(); // 每次重新创建

// ExperienceAgent (Good):
constructor() {
  this.worldModel = new WorldModel(); // 持久化
}
```

### 2. 真实业务 Executor（不再是 Math.random()）
```typescript
// Payment Success Rate
// Credit Card: 98%
// PayPay: 95%
// PayPal: 88%
// 这些来自真实业务，不是假的！
```

### 3. 正确的 Rule Learning（丢弃 ID，保留业务属性）
```typescript
// No:
IF booking.id = BKG-1000 AND payment.id = PAY-1

// Yes:
IF booking.status = confirmed 
AND payment.status = paid 
AND payment.method = credit_card
THEN booking.cancel
```

### 4. Policy Learning（Q-Learning，不是简单统计）
```typescript
// Q(state, strategy)
// 学习在不同 Context 下哪种策略最好
// e.g., 在 PayPal 时，Episode Reuse 更好
```

---

## Key Features

| Feature | Status |
|---------|--------|
| Persistent World Model | ✅ |
| Real Business Executors | ✅ |
| Episode DB (Goal + State + Context) | ✅ |
| Rule Learner (ID-free) | ✅ |
| Policy Learner (Q-Learning) | ✅ |
| Episode Retrieval (CBR) | ✅ |

---

这不是一个认知架构玩具。这是一个真正的业务学习 Agent！
