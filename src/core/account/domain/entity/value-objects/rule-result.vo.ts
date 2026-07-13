// Unified result type for all business rule evaluations
export interface RuleResult {
  passed: boolean;
  ruleName: string;
  message: string;
  details?: Record<string, unknown>;
}

export function rulePassed(ruleName: string, message?: string): RuleResult {
  return { passed: true, ruleName, message: message ?? "OK" };
}

export function ruleFailed(ruleName: string, message: string, details?: Record<string, unknown>): RuleResult {
  return { passed: false, ruleName, message, details };
}
