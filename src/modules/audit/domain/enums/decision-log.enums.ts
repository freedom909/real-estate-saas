export const DECISION_SOURCE = ["CHAT", "API", "SYSTEM"] as const;
export type DecisionSource = typeof DECISION_SOURCE[number];