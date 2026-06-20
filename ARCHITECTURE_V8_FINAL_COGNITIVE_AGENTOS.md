
# AgentOS v4 - 完整认知架构（SOAR + ACT-R + OpenCog）

## 概述

AgentOS v4 现在是一个**完整的认知架构（Cognitive Architecture）**，融合了：
- **SOAR**：Chunking（推理压缩）、问题空间搜索
- **ACT-R**：ACT-R 风格的工作记忆（Activation + Decay + Competition）
- **OpenCog**：认知图谱（ConceptNode, PredicateNode, InheritanceLink, ImplicationLink）
- **Truth Maintenance System (TMS)**：真理维护系统
- **Proceduralization**：技能程序化（自动学习）

## 完整架构层级

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                         USER                                            │
└───────────────────────────────────────────────────────┬─────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SEMANTIC LAYER                                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐                            │
│  │ Rule Extractor (fast)    │  │ LLM Extractor (smart)    │                            │
│  └──────────────────────────┴──────────────────────────┘                            │
└───────────────────────────────────────────────────────┬─────────────────────────────────┘
                                                        │
┌───────────────────────────────────────────────────────┼─────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               OODA LOOP (Observe → Orient → Decide → Act)          │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┼─────────────────────────────────┘
                                                        │
         ┌──────────────────────────────────────────────┼──────────────────────────────┐
         │                                              │                              │
         ▼                                              ▼                              ▼
┌───────────────────────┐                  ┌───────────────────────┐      ┌──────────────────┐
│   TRUTH MAINTENANCE   │                  │   COGNITIVE GRAPH      │      │  WORKING MEMORY  │
│   SYSTEM (TMS)        │                  │   (OpenCog-style)       │      │   (ACT-R-style)   │
│                       │                  │                       │      │                  │
│ • Justification-based │                  │ • ConceptNode         │      │ • Chunks         │
│ • Truth values        │                  │ • PredicateNode       │      │ • Activation     │
│ • Contradiction       │                  │ • InheritanceLink     │      │ • Decay (Base-level│
│   detection &         │                  │ • ImplicationLink     │      │   Learning)       │
│   resolution          │                  │ • EvaluationLink      │      │ • Retrieval      │
└───────────────────────┘                  └───────────────────────┘      └──────────────────┘
         │                                              │                              │
         └──────────────────────────┬───────────────────┴──────────────────────────────┘
                                    │
                                    ▼
                  ┌──────────────────────────────┐
                  │    COGNITIVE REASONING        │
                  └──────────────────────────────┘
                  │                              │
                  ▼                              ▼
        ┌───────────────────┐         ┌───────────────────┐
        │ Deduction         │         │ Abduction         │
        │ (General → Spec)  │         │ (Observation →    │
        └───────────────────┘         │   Explanation)    │
                                      └───────────────────┘
                  │                              │
                  ▼                              ▼
        ┌───────────────────┐         ┌───────────────────┐
        │ Induction         │         │ Causal Reasoning  │
        │ (Spec → General)  │         │ & Counterfactual  │
        └───────────────────┘         └───────────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │   SOAR CHUNKING       │
                          │   (Reasoning Compression)│
                          └───────────────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  PROCEDURALIZATION    │
                          │  (Skill Learning)     │
                          └───────────────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  HTN SKILL LIBRARY    │
                          └───────────────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  EXECUTION LAYER      │
                          └───────────────────────┘
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  WORLD STATE OBSERVER │
                          └───────────────────────┘
```

## 核心特性

### 1. 真理维护系统 (Truth Maintenance System)
- 基于正当理由（Justification-based）的信念维护
- 自动矛盾检测与解决
- 信念撤回与传播
- 证据强度计算

### 2. 认知图谱 (OpenCog 风格)
- **ConceptNode**：概念节点
- **PredicateNode**：谓词节点
- **InheritanceLink**：继承关系
- **ImplicationLink**：蕴涵关系
- **EvaluationLink**：评估关系
- 演绎推理（Deduction）
- 溯因推理（Abduction）

### 3. ACT-R 风格工作记忆
- **Chunk Activation**：激活计算
- **Base-Level Learning**：基础学习与衰减
- **Retrieval Competition**：检索竞争
- **Latency Equation**：反应时间计算

### 4. SOAR 风格推理压缩 (Chunking)
- **推理追踪记录**
- **相似轨迹识别**
- **推理压缩**
- **自动技能生成**
- **效用学习**（Utility Learning）

### 5. 程序化学习 (Proceduralization)
- 从 Chunk 自动生成 HTN Skill
- 技能成功率跟踪
- 技能效用优化

### 6. 多模态认知推理
- **演绎推理 (Deduction)**：从一般到特殊
- **溯因推理 (Abduction)**：从观察到解释
- **归纳推理 (Induction)**：从特殊到一般
- **因果推理 (Causal)**：因果关系分析
- **反事实推理 (Counterfactual)**：What-if 分析

## 与经典认知架构的对齐

| 特性 | AgentOS v4 | SOAR | ACT-R | OpenCog |
|------|------------|------|-------|---------|
| 工作记忆 | ✅ ACT-R 风格 | ✅ | ✅ | ✅ |
| 语义记忆 | ✅ 认知图谱 | ✅ | ✅ | ✅ |
| 程序性记忆 | ✅ HTN 技能库 | ✅ | ✅ | ✅ |
| Chunking (推理压缩) | ✅ | ✅ | | |
| 激活与衰减 | ✅ ACT-R 风格 | | ✅ | |
| 真理维护 | ✅ TMS | | | ✅ |
| 认知图谱 | ✅ OpenCog 风格 | | | ✅ |
| 多模态推理 | ✅ D/A/I/C/C | ✅ | ✅ | ✅ |
| 强化学习 (效用) | ✅ | ✅ | ✅ | ✅ |

## 为什么这是一个真正的认知架构

1. **不是规则引擎**：推理基于信念、证据、激活，而非硬编码规则
2. **不是工作流引擎**：没有固定路径，动态构建解决方案
3. **有记忆**：三种记忆系统协同工作
4. **会学习**：从经验中压缩推理、生成技能
5. **能自省**：有元认知能力
6. **维护真理**：TMS 确保信念一致性

## 层级总结

- **Level 1-3**：已实现的工作流与基础 Agent
- **Level 4**：✅ Truth Maintenance System
- **Level 5**：✅ Cognitive Reasoning Engine + Chunking + Proceduralization
- **Cognitive Architecture**：✅ Now a complete cognitive architecture!
