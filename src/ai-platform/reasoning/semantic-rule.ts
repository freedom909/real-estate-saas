
/**
 * Semantic Rule - 学习到的规则！
 */

export interface RuleCondition {
  feature: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "in";
  value: any;
}

export interface SemanticRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  action: string;
  confidence: number; // 0-1
  support: number; // 样本数
  createdAt: number;
  lastUsedAt: number;
}
