# AI Planning Engine V3 - Architecture Document

## Overview
This is the V3 implementation of our AI-driven business capability planning and execution system, implementing true goal-driven state transition planning.

## Key Principles
1. **Registry as Knowledge Base**: Pure metadata, no executable code
2. **Capability Factory**: Responsible for creating runtime executors
3. **State-Driven Planning**: WorldState model with preconditions and effects
4. **Goal-Driven Execution**: User intent -> GoalState -> Automatic plan generation
5. **Observe & Replan Loop**: Continuous feedback and adaptation

## Directory Structure
```
src/ai-platform/domain/orchestration/
├── registry/                          # Pure knowledge base
│   ├── booking.registry.ts
│   ├── listing.registry.ts
│   ├── payment.registry.ts
│   ├── review.registry.ts
│   ├── capability-registry.types.ts
│   └── index.ts
│
├── planner/                           # Goal & plan generation
│   ├── goal.parser.ts                 # Intent -> GoalState
│   ├── state.transition.planner.ts    # GoalState -> Plan (actions + dependencies)
│   ├── dependency.builder.ts
│   ├── graph.builder.ts
│   └── workflow.planner.ts
│
├── state/                             # World state management
│   ├── world-state.ts                 # Type definitions & operators
│   └── state.store.ts                 # State management with history
│
├── factory/                           # Runtime executor factory
│   └── capability.factory.ts
│
├── executor/                          # Plan execution
│   └── workflow.executor.ts
│
├── observation/                       # Execution observation
│   └── observation.layer.ts
│
├── replan/                            # Replan engine
│   └── replan.engine.ts
│
├── graph/                             # Dependency graph
│   └── workflow.graph.ts
│
└── runtime/                           # Full agent loop
    └── workflow.runtime.ts
```

## Core Components

### 1. Registry (Knowledge Base)
Each capability is defined as metadata:
```typescript
{
  id: "CANCEL_BOOKING",
  domain: AIDomain.BOOKING,
  description: "Cancel an existing booking",
  
  // State transition rules
  preconditions: [
    { entity: "booking", field: "status", operator: Operator.EQ, value: "confirmed" }
  ],
  effects: [
    { entity: "booking", field: "status", value: "cancelled" }
  ],
  
  // Execution metadata
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

### 2. Goal Parser
Converts natural language intent to structured GoalState:
```typescript
GoalState = [
  { entity: "booking", field: "status", value: "cancelled" },
  { entity: "refund", field: "created", value: true }
]
```

### 3. State Transition Planner
- Analyzes current WorldState
- Finds capabilities whose effects match goal state
- Builds dependency graph via preconditions matching effects
- Generates topological-sorted execution plan

### 4. Capability Factory
Pure factory pattern:
```typescript
CapabilityFactory.get("booking.cancel") → ExecutorClass
```

### 5. Workflow Runtime (Full Agent Loop)
```
1. Parse Intent → GoalState
2. Plan: CurrentState → (Planner) → ExecutionPlan
3. Execute Plan step by step
4. Observe: Update WorldState with results
5. Check Goal Achievement → Done or Replan
```

## Benefits
- **Dynamic Planning**: No hardcoded workflows
- **Maintainability**: Registry updates don't require code changes
- **Testability**: Pure functions for planning logic
- **Extensibility**: Easy to add new capabilities
- **Adaptability**: Observ + Replan handles failures and changes

## Next Steps
- LLM integration for GoalParser
- Advanced Planner with cost optimization
- Persistent StateStore
- Plan visualization
- Multi-agent coordination
