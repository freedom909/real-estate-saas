//src/modules/audit/domain/enums/decision-log.enums.ts

export const DECISION_SOURCE = ["CHAT", "API", "SYSTEM"] as const;
export type DecisionSource = typeof DECISION_SOURCE[number];